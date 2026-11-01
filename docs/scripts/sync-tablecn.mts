/**
 * Copies the data table and data grid from tablecn, which is their source of
 * truth, so the docs registry can't fall behind.
 *
 * The tablecn commit is pinned in `registry/tablecn.json`. Files under tablecn
 * `src/` map one-to-one onto `docs/`, and the `components/data-*` re-exports
 * the examples import from are kept in step.
 *
 *   pnpm tablecn:sync                   sync from the pinned commit
 *   pnpm tablecn:sync --ref main        pin a new commit, then sync
 *   pnpm tablecn:sync --local ../tablecn  sync from a local checkout
 *   pnpm tablecn:check                  fail if a copy differs from the pin
 */
import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const REPO = "sadmann7/tablecn";
const DOCS_PATH = path.resolve(import.meta.dirname, "..");
const PIN_PATH = path.join(DOCS_PATH, "registry/tablecn.json");
const BASES = ["radix", "base"] as const;
const SHIM_DIRS = ["data-table", "data-grid"] as const;

const SHARED_FILES = new Set([
  "hooks/use-badge-overflow.ts",
  "hooks/use-debounced-callback.ts",
  "hooks/use-value-as-ref.ts",
]);

interface Source {
  label: string;
  listFiles: () => Promise<string[]>;
  readFile: (file: string) => Promise<string>;
}

const args = process.argv.slice(2);
const isCheck = args.includes("--check");
const localPath = getArg("--local");
const nextRef = getArg("--ref");

const pin = await readPin();
const ref = nextRef ? await resolveRef(nextRef) : pin.ref;
const source = localPath ? getLocalSource(localPath) : getRemoteSource(ref);

const upstreamFiles = (await source.listFiles()).filter(getIsSyncedFile);
const expected = new Map<string, string>();
await Promise.all(
  upstreamFiles.map(async (file) => {
    expected.set(file, await source.readFile(file));
  }),
);
for (const [file, content] of getShims(upstreamFiles)) {
  expected.set(file, content);
}

const localFiles = (await listLocalFiles()).filter(
  (file) => getIsSyncedFile(file) || getIsShim(file),
);
const changed = (
  await Promise.all(
    [...expected].map(async ([file, content]) =>
      (await readLocal(file)) === content ? null : file,
    ),
  )
).filter((file): file is string => file !== null);
const removed = localFiles.filter((file) => !expected.has(file));

if (isCheck) {
  if (changed.length > 0 || removed.length > 0) {
    for (const file of changed) console.error(`  differs   ${file}`);
    for (const file of removed) console.error(`  extra     ${file}`);
    console.error(
      `\n${changed.length + removed.length} files are out of sync with tablecn@${ref.slice(0, 7)}. Run \`pnpm tablecn:sync\`.`,
    );
    process.exit(1);
  }
  console.log(`${expected.size} files match tablecn@${ref.slice(0, 7)}`);
} else {
  for (const file of changed) {
    await fs.mkdir(path.dirname(path.join(DOCS_PATH, file)), {
      recursive: true,
    });
    await fs.writeFile(path.join(DOCS_PATH, file), expected.get(file) ?? "");
  }
  for (const file of removed) await fs.rm(path.join(DOCS_PATH, file));
  if (nextRef) await writePin(ref);

  const missing = await getMissingImports(expected);
  for (const file of changed) console.log(`  updated   ${file}`);
  for (const file of removed) console.log(`  removed   ${file}`);
  console.log(
    `\nSynced ${changed.length} and removed ${removed.length} files from ${source.label}`,
  );
  if (localPath) {
    console.warn(
      "Synced from a local checkout, so `pnpm tablecn:check` keeps comparing against the pinned commit until it's bumped with --ref.",
    );
  }
  if (missing.length > 0) {
    console.error("\nThese imports don't resolve in docs:");
    for (const entry of missing) console.error(`  ${entry}`);
    process.exit(1);
  }
}

function getArg(name: string) {
  const index = args.indexOf(name);
  return index === -1 ? undefined : args[index + 1];
}

function getIsSyncedFile(file: string) {
  if (SHARED_FILES.has(file)) return true;
  if (/^lib\/data-(table|grid)-[\w-]+\.ts$/.test(file)) return true;
  return BASES.some(
    (base) =>
      file === `registry/bases/${base}/hooks/use-data-table.ts` ||
      file === `registry/bases/${base}/hooks/use-data-grid.ts` ||
      SHIM_DIRS.some((dir) =>
        file.startsWith(`registry/bases/${base}/components/${dir}/`),
      ),
  );
}

function getIsShim(file: string) {
  return SHIM_DIRS.some((dir) => file.startsWith(`components/${dir}/`));
}

function getShims(files: string[]) {
  return files.flatMap((file) => {
    const match =
      /^registry\/bases\/radix\/(components\/data-(?:table|grid)\/[\w-]+\.tsx)$/.exec(
        file,
      );
    if (!match?.[1]) return [];
    return [
      [match[1], `"use client";\n\nexport * from "@/${file}";\n`] as const,
    ];
  });
}

async function getMissingImports(files: Map<string, string>) {
  const missing: string[] = [];
  for (const [file, content] of files) {
    for (const [, specifier] of content.matchAll(/from "@\/([^"]+)"/g)) {
      if (!specifier) continue;
      const candidates = ["", ".ts", ".tsx", "/index.ts"].map((ext) =>
        path.join(DOCS_PATH, `${specifier}${ext}`),
      );
      const exists = await Promise.all(
        candidates.map((candidate) =>
          fs.stat(candidate).then(
            (stat) => stat.isFile(),
            () => false,
          ),
        ),
      );
      if (!exists.some(Boolean)) missing.push(`${file} -> @/${specifier}`);
    }
  }
  return missing;
}

async function listLocalFiles(dir = DOCS_PATH, prefix = ""): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.name === "node_modules" || entry.name.startsWith(".")) {
        return [];
      }
      return entry.isDirectory()
        ? listLocalFiles(path.join(dir, entry.name), relativePath)
        : [relativePath];
    }),
  );
  return files.flat();
}

async function readLocal(file: string) {
  return fs.readFile(path.join(DOCS_PATH, file), "utf8").catch(() => null);
}

async function readPin(): Promise<{ ref: string }> {
  return JSON.parse(await fs.readFile(PIN_PATH, "utf8"));
}

async function writePin(nextPin: string) {
  await fs.writeFile(
    PIN_PATH,
    `${JSON.stringify({ ref: nextPin }, null, 2)}\n`,
  );
}

async function resolveRef(name: string) {
  const commit = await fetchJson<{ sha: string }>(
    `https://api.github.com/repos/${REPO}/commits/${name}`,
  );
  return commit.sha;
}

function getRemoteSource(commit: string): Source {
  return {
    label: `tablecn@${commit.slice(0, 7)}`,
    listFiles: async () => {
      const tree = await fetchJson<{ tree: { path: string; type: string }[] }>(
        `https://api.github.com/repos/${REPO}/git/trees/${commit}?recursive=1`,
      );
      return tree.tree
        .filter(
          (entry) => entry.type === "blob" && entry.path.startsWith("src/"),
        )
        .map((entry) => entry.path.slice("src/".length));
    },
    readFile: async (file) => {
      const response = await fetch(
        `https://raw.githubusercontent.com/${REPO}/${commit}/src/${file}`,
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch ${file}: ${response.status}`);
      }
      return response.text();
    },
  };
}

function getLocalSource(root: string): Source {
  const srcPath = path.resolve(root, "src");
  const files = execFileSync("git", ["ls-files", "src"], {
    cwd: path.resolve(root),
    encoding: "utf8",
  });
  return {
    label: path.resolve(root),
    listFiles: async () =>
      files
        .split("\n")
        .filter(Boolean)
        .map((file) => file.slice("src/".length)),
    readFile: (file) => fs.readFile(path.join(srcPath, file), "utf8"),
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}): ${url}`);
  }
  return response.json() as Promise<T>;
}
