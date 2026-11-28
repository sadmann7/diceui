/**
 * Reports how far each component's Radix and Base UI copies have drifted.
 *
 * Every file under `registry/bases/radix` with a namesake under
 * `registry/bases/base` is a pair, except the files synced from tablecn and
 * shadcn, which those repos own. Each pair is diffed twice: as written, and after
 * the differences the bases are expected to have are taken out, which are
 * imports, `asChild` against `render`, the primitive each base wraps, and
 * attributes written as JSX against the same attributes passed to
 * `useRender`. What's left is listed per component.
 *
 *   pnpm registry:drift                 table of every pair
 *   pnpm registry:drift rating swap     the lines left in these pairs
 *   pnpm registry:drift --markdown      the table as Markdown, for CI
 *
 * It's a report: it exits 0 whatever it finds.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const DOCS_PATH = path.resolve(import.meta.dirname, "..");
const BASES_PATH = path.join(DOCS_PATH, "registry/bases");
const PIN_PATH = path.join(DOCS_PATH, "registry/tablecn.json");
const DIRS = ["ui", "components", "hooks", "lib"] as const;
const SHADCN_DIRS = new Set(["ui", "hooks"]);

const EXPECTED_PATTERNS = [
  /\basChild\b/,
  /\brender\b/,
  /\buseRender\b/,
  /\bmergeProps\b/,
  /\bSlot(Primitive)?\b/,
  /\bdefaultTagName\b/,
  /\b\w+Primitive\b/,
  /^(props|state):/,
  /^(\.\.\.)?\w+Props(,|: \w+Props)?$/,
  /\belement\b/,
  /^return \($/,
  /^interface \w+Props$/,
  /^interface \w+Props extends .*\{$/,
];

const PUNCTUATION_PATTERN = /^[\s{}()[\];,<>/]*$/;

interface Pair {
  name: string;
  radix: string;
  base: string;
}

interface Hunk {
  radix: string[];
  base: string[];
}

interface Drift {
  name: string;
  rawLines: number;
  hunks: Hunk[];
  lines: number;
}

const args = process.argv.slice(2);
const isMarkdown = args.includes("--markdown");
const names = args.filter((arg) => !arg.startsWith("--"));

const drifts = (await getPairs()).map(getDrift);
drifts.sort((a, b) => b.lines - a.lines || a.name.localeCompare(b.name));

if (names.length > 0) {
  for (const drift of drifts.filter(
    (d) => names.includes(d.name) || names.includes(path.basename(d.name)),
  )) {
    printHunks(drift);
  }
} else if (isMarkdown) {
  printMarkdown(drifts);
} else {
  printTable(drifts);
}

async function getPairs(): Promise<Pair[]> {
  const pin = JSON.parse(await fs.readFile(PIN_PATH, "utf8")) as {
    files?: string[];
  };
  const synced = new Set(pin.files ?? []);
  const pairs: Pair[] = [];

  for (const dir of DIRS) {
    const radixDir = path.join(BASES_PATH, "radix", dir);
    const owned = await getOwnedFiles(radixDir);
    for (const file of await listFiles(radixDir)) {
      const relative = path.relative(radixDir, file);
      if (path.basename(relative).startsWith("_registry")) continue;
      if (synced.has(`registry/bases/radix/${dir}/${relative}`)) continue;
      if (SHADCN_DIRS.has(dir) && !owned.has(`${dir}/${relative}`)) continue;

      const base = path.join(BASES_PATH, "base", dir, relative);
      if (!(await getIsFile(base))) continue;

      pairs.push({
        name: `${dir}/${relative}`.replace(/\.tsx?$/, ""),
        radix: await fs.readFile(file, "utf8"),
        base: await fs.readFile(base, "utf8"),
      });
    }
  }

  return pairs;
}

async function getOwnedFiles(dir: string) {
  const registry = await fs
    .readFile(path.join(dir, "_registry.ts"), "utf8")
    .catch(() => "");
  return new Set(
    [...registry.matchAll(/path: "([^"]+)"/g)].map((match) => match[1]),
  );
}

async function listFiles(dir: string): Promise<string[]> {
  const entries = await fs
    .readdir(dir, { withFileTypes: true })
    .catch(() => []);
  const files = await Promise.all(
    entries.map((entry) => {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) return listFiles(file);
      return /\.tsx?$/.test(entry.name) ? [file] : [];
    }),
  );
  return files.flat();
}

async function getIsFile(file: string) {
  return fs
    .stat(file)
    .then((stat) => stat.isFile())
    .catch(() => false);
}

function getDrift(pair: Pair): Drift {
  const rawHunks = diff(pair.radix.split("\n"), pair.base.split("\n"));
  const normalizedHunks = diff(normalize(pair.radix), normalize(pair.base));

  const moved = new Map<string, number>();
  for (const hunk of normalizedHunks) {
    for (const line of hunk.radix) moved.set(line, (moved.get(line) ?? 0) + 1);
  }
  const unmatched = new Map(moved);
  for (const hunk of normalizedHunks) {
    hunk.base = hunk.base.filter((line) => {
      const count = unmatched.get(line) ?? 0;
      if (count === 0) return true;
      unmatched.set(line, count - 1);
      return false;
    });
  }
  for (const hunk of normalizedHunks) {
    hunk.radix = hunk.radix.filter((line) => {
      const count = moved.get(line) ?? 0;
      const left = unmatched.get(line) ?? 0;
      if (count > left) {
        moved.set(line, count - 1);
        return false;
      }
      return true;
    });
  }

  const hunks = normalizedHunks
    .map((hunk) => ({
      radix: hunk.radix.filter((line) => !getIsExpected(line)),
      base: hunk.base.filter((line) => !getIsExpected(line)),
    }))
    .filter((hunk) => hunk.radix.length + hunk.base.length > 0);

  return {
    name: pair.name,
    rawLines: countLines(rawHunks),
    hunks,
    lines: countLines(hunks),
  };
}

function normalize(source: string): string[] {
  return source
    .replace(/^import[\s\S]*?from\s+"[^"]+";$/gm, "")
    .replace(/^import\s+"[^"]+";$/gm, "")
    .replace(/@\/registry\/bases\/(radix|base)\//g, "@/registry/bases/<base>/")
    .split("\n")
    .map(normalizeLine)
    .filter((line) => !PUNCTUATION_PATTERN.test(line));
}

function normalizeLine(line: string) {
  const trimmed = line
    .trim()
    .replace(/ as (React\.AriaRole|const)\b/g, "")
    .replace(/^\{(\.\.\.\w+)\}$/, "$1");
  const flag =
    /^([\w-]+)=\{(.+?) \? "" : undefined\}$/.exec(trimmed) ??
    /^"?([\w-]+)"?: (.+?) \? "" : undefined,?$/.exec(trimmed);
  const spreadFlag = /^\.\.\.\((.+?) && \{ "?([\w-]+)"?: "" \}\),?$/.exec(
    trimmed,
  );
  if (flag?.[1] && flag[2]) return `${toKey(flag[1])}: flag(${flag[2]})`;
  if (spreadFlag?.[1] && spreadFlag[2]) {
    return `${toKey(spreadFlag[2])}: flag(${spreadFlag[1]})`;
  }

  const shorthand = /^(\w+),$/.exec(trimmed);
  if (shorthand?.[1]) return `${shorthand[1]}: ${shorthand[1]}`;

  const attribute =
    /^([\w-]+)=\{(.*)\}$/.exec(trimmed) ??
    /^([\w-]+)=\{(.*)$/.exec(trimmed) ??
    /^([\w-]+)=(".*")$/.exec(trimmed) ??
    /^"?([\w-]+)"?:\s*(.*?),?$/.exec(trimmed);
  if (!attribute?.[1] || attribute[2] === undefined) return trimmed;

  return `${toKey(attribute[1])}: ${attribute[2]}`;
}

function toKey(attribute: string) {
  return attribute
    .replace(/^data-/, "")
    .replace(/-(\w)/g, (_, char: string) => char.toUpperCase());
}

function getIsExpected(line: string) {
  return EXPECTED_PATTERNS.some((pattern) => pattern.test(line));
}

function countLines(hunks: Hunk[]) {
  return hunks.reduce(
    (total, hunk) => total + hunk.radix.length + hunk.base.length,
    0,
  );
}

function diff(a: string[], b: string[]): Hunk[] {
  const max = a.length + b.length;
  const offset = max + 1;
  const frontier = new Int32Array(2 * max + 3);
  const trace: Int32Array[] = [];

  outer: for (let d = 0; d <= max; d++) {
    trace.push(frontier.slice());
    for (let k = -d; k <= d; k += 2) {
      const isDown =
        k === -d ||
        (k !== d &&
          (frontier[offset + k - 1] ?? 0) < (frontier[offset + k + 1] ?? 0));
      let x = isDown
        ? (frontier[offset + k + 1] ?? 0)
        : (frontier[offset + k - 1] ?? 0) + 1;
      let y = x - k;
      while (x < a.length && y < b.length && a[x] === b[y]) {
        x++;
        y++;
      }
      frontier[offset + k] = x;
      if (x >= a.length && y >= b.length) break outer;
    }
  }

  const edits: ("=" | "-" | "+")[] = [];
  let x = a.length;
  let y = b.length;
  for (let d = trace.length - 1; d >= 0; d--) {
    const previous = trace[d];
    if (!previous) break;
    const k = x - y;
    const isDown =
      k === -d ||
      (k !== d &&
        (previous[offset + k - 1] ?? 0) < (previous[offset + k + 1] ?? 0));
    const previousK = isDown ? k + 1 : k - 1;
    const previousX = previous[offset + previousK] ?? 0;
    const previousY = previousX - previousK;
    while (x > previousX && y > previousY) {
      edits.push("=");
      x--;
      y--;
    }
    if (d > 0) edits.push(isDown ? "+" : "-");
    x = previousX;
    y = previousY;
  }
  edits.reverse();

  const hunks: Hunk[] = [];
  let current: Hunk | null = null;
  let ai = 0;
  let bi = 0;
  for (const edit of edits) {
    if (edit === "=") {
      current = null;
      ai++;
      bi++;
      continue;
    }
    if (!current) {
      current = { radix: [], base: [] };
      hunks.push(current);
    }
    if (edit === "-") current.radix.push(a[ai++] ?? "");
    else current.base.push(b[bi++] ?? "");
  }
  return hunks;
}

function getTotals(drifts: Drift[]) {
  return {
    pairs: drifts.length,
    identical: drifts.filter((d) => d.rawLines === 0).length,
    clean: drifts.filter((d) => d.lines === 0).length,
    rawLines: drifts.reduce((total, d) => total + d.rawLines, 0),
    lines: drifts.reduce((total, d) => total + d.lines, 0),
  };
}

function printTable(drifts: Drift[]) {
  const width = Math.max(...drifts.map((d) => d.name.length));
  console.log(`${"pair".padEnd(width)}  ${"raw".padStart(5)}  left`);
  for (const drift of drifts) {
    if (drift.rawLines === 0) continue;
    console.log(
      `${drift.name.padEnd(width)}  ${String(drift.rawLines).padStart(5)}  ${drift.lines}`,
    );
  }
  const totals = getTotals(drifts);
  console.log(
    `\n${totals.pairs} pairs, ${totals.identical} identical, ${totals.clean} with only expected differences.`,
  );
  console.log(
    `${totals.rawLines} differing lines, ${totals.lines} left after expected differences.`,
  );
}

function printMarkdown(drifts: Drift[]) {
  const totals = getTotals(drifts);
  console.log("## Drift between bases\n");
  console.log(
    `${totals.pairs} pairs, ${totals.identical} identical, ${totals.clean} with only expected differences. ${totals.rawLines} differing lines, ${totals.lines} left after expected differences.\n`,
  );
  console.log("| Pair | Differing lines | Left |");
  console.log("| --- | ---: | ---: |");
  for (const drift of drifts) {
    if (drift.lines === 0) continue;
    console.log(`| \`${drift.name}\` | ${drift.rawLines} | ${drift.lines} |`);
  }
}

function printHunks(drift: Drift) {
  console.log(`\n${drift.name}: ${drift.lines} lines left\n`);
  for (const hunk of drift.hunks) {
    for (const line of hunk.radix) console.log(`- radix  ${line}`);
    for (const line of hunk.base) console.log(`+ base   ${line}`);
    console.log("");
  }
}
