/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/scripts/build-registry.mts
 */

import type { z } from "zod";

import { createHash } from "node:crypto";
import { existsSync, promises as fs, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { availableParallelism } from "node:os";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { rimraf } from "rimraf";
import {
  type RegistryItem,
  type registryItemTypeSchema,
  registrySchema,
} from "shadcn/schema";
import { transformDirection } from "shadcn/utils";

import { DEFAULT_BASE, DEFAULT_STYLE } from "../lib/constants";
import { BASES } from "../registry/bases";
import { type RegistryBase, registries } from "../registry/registry";
import { STYLES } from "../registry/styles";
import { writeIconsModule } from "./icons.mts";
import {
  getStyleMaps,
  type StyleMap,
  writeStyleMapsModule,
} from "./style-maps.mts";

const REGISTRY_PATH = path.join(process.cwd(), "public/r");
const STYLES_PATH = path.join(REGISTRY_PATH, "styles");

// Types included in the per-style public registry.
const REGISTRY_INDEX_WHITELIST: z.infer<typeof registryItemTypeSchema>[] = [
  "registry:ui",
  "registry:lib",
  "registry:hook",
  "registry:theme",
  "registry:block",
  "registry:example",
  "registry:component",
  "registry:internal",
  "registry:style",
];

const STYLE_COMBINATIONS = BASES.flatMap((base) =>
  STYLES.map((style) => ({
    base,
    style,
    name: `${base.name}-${style.name}`,
    title: `${base.title} ${style.title}`,
  })),
);

const itemDependencyCache = new Map<string, string[] | undefined>();

// Components import cn directly, so every item that uses it declares the
// package. Projects initialized before cn existed rely on this to install it.
function getItemDependencies(
  item: Pick<RegistryItem, "dependencies">,
  fileContents: Array<string | null | undefined>,
) {
  const dependencies = item.dependencies ?? [];
  if (dependencies.includes("cn")) {
    return item.dependencies;
  }

  for (const content of fileContents) {
    if (content && /from ["']cn["']/.test(content)) {
      return ["cn", ...dependencies];
    }
  }

  return item.dependencies;
}

async function resolveItemDependencies(
  baseName: RegistryBase,
  item: Pick<RegistryItem, "name" | "dependencies" | "files">,
) {
  const cacheKey = `${baseName}:${item.name}`;
  if (itemDependencyCache.has(cacheKey)) {
    return itemDependencyCache.get(cacheKey);
  }

  const baseSrcRoot = path.join(process.cwd(), "registry", "bases", baseName);
  const contents: string[] = [];
  for (const file of item.files ?? []) {
    const filePath = typeof file === "string" ? file : file.path;
    try {
      contents.push(
        await fs.readFile(path.join(baseSrcRoot, filePath), "utf8"),
      );
    } catch {
      // Missing file — skip, same as the public JSON builder.
    }
  }

  const dependencies = getItemDependencies(item, contents);
  itemDependencyCache.set(cacheKey, dependencies);
  return dependencies;
}

// ----------------------------------------------------------------------------
// Build public/r/styles/{base}-{style}/registry.json and index.json.
// ----------------------------------------------------------------------------
async function buildRegistryJson() {
  for (const { name: styleName, base } of STYLE_COMBINATIONS) {
    const baseName = base.name as RegistryBase;
    const registry = registries[baseName];
    const outputDir = path.join(STYLES_PATH, styleName);
    await fs.mkdir(outputDir, { recursive: true });

    const uiItems = await Promise.all(
      registry.items
        .filter((item) => item.type === "registry:ui")
        .map(async (item) => {
          const dependencies = await resolveItemDependencies(baseName, item);
          return {
            ...item,
            ...(dependencies && { dependencies }),
            files: item.files?.map((_file) =>
              typeof _file === "string"
                ? { path: _file, type: item.type }
                : _file,
            ),
          };
        }),
    );
    await fs.writeFile(
      path.join(outputDir, "index.json"),
      JSON.stringify(uiItems, null, 2),
      "utf8",
    );

    const allItems = await Promise.all(
      registry.items
        .filter((item) => REGISTRY_INDEX_WHITELIST.includes(item.type))
        .filter((item) => item.name !== "index")
        .map(async (item) => {
          const dependencies = await resolveItemDependencies(baseName, item);
          return {
            ...item,
            ...(dependencies && { dependencies }),
            files: item.files?.map((_file) =>
              typeof _file === "string"
                ? { path: _file, type: item.type }
                : _file,
            ),
          };
        }),
    );
    await fs.writeFile(
      path.join(outputDir, "registry.json"),
      JSON.stringify(
        { name: registry.name, homepage: registry.homepage, items: allItems },
        null,
        2,
      ),
      "utf8",
    );
  }
}

// ----------------------------------------------------------------------------
// Build public/r/styles/index.json listing all available styles.
// ----------------------------------------------------------------------------
async function buildStylesIndex() {
  const stylesIndex = STYLE_COMBINATIONS.map(({ name, title, base }) => ({
    name,
    label: title,
    base: base.name,
  }));

  await fs.mkdir(STYLES_PATH, { recursive: true });
  await fs.writeFile(
    path.join(STYLES_PATH, "index.json"),
    JSON.stringify(stylesIndex, null, 2),
    "utf8",
  );
}

// ----------------------------------------------------------------------------
// Build public/r/index.json (top-level UI component listing).
// ----------------------------------------------------------------------------
async function buildRootIndex() {
  const registry = registries[DEFAULT_BASE];

  const uiItems = await Promise.all(
    registry.items
      .filter((item) => item.type === "registry:ui")
      .map(async (item) => {
        const dependencies = await resolveItemDependencies(DEFAULT_BASE, item);
        // oxlint-disable-next-line typescript/no-explicit-any -- registry item types vary
        const mapped: Record<string, any> = {
          name: item.name,
          type: item.type,
        };
        if (dependencies?.length) mapped.dependencies = dependencies;
        if (item.registryDependencies?.length)
          mapped.registryDependencies = item.registryDependencies;
        if (item.files) {
          mapped.files = item.files.map((_file) => {
            const file =
              typeof _file === "string"
                ? { path: _file, type: item.type }
                : _file;
            return { path: file.path, type: file.type };
          });
        }
        return mapped;
      }),
  );

  await fs.writeFile(
    path.join(REGISTRY_PATH, "index.json"),
    JSON.stringify(uiItems, null, 2),
    "utf8",
  );
}

// ----------------------------------------------------------------------------
// Build public/r/styles/{base}-{style}/{name}.json with inlined file content.
// ----------------------------------------------------------------------------
const compiledSources = new Map<string, Promise<string>>();

// Compiled sources persist in `.next/cache`, which Vercel restores between
// deployments, so unchanged files skip `transformStyle`.
const COMPILE_CACHE_PATH = path.join(process.cwd(), ".next/cache/registry");
const COMPILE_CACHE_VERSION = (() => {
  let dir = path.dirname(
    createRequire(import.meta.url).resolve("shadcn/utils"),
  );
  for (;;) {
    const manifest = path.join(dir, "package.json");
    if (existsSync(manifest)) {
      const pkg = JSON.parse(readFileSync(manifest, "utf8"));
      if (pkg.name === "shadcn") return `1:${pkg.version}`;
    }
    dir = path.dirname(dir);
  }
})();
const usedCacheFiles = new Set<string>();

const workers = Array.from(
  { length: Math.max(1, availableParallelism() - 1) },
  () =>
    new Worker(new URL("./compile-style-worker.mts", import.meta.url), {
      execArgv: ["--import", "tsx"],
    }),
);
const pending = new Map<number, (result: string) => void>();
let nextId = 0;

for (const worker of workers) {
  worker.on("message", ({ id, result }: { id: number; result: string }) => {
    pending.get(id)?.(result);
    pending.delete(id);
  });
}

function compileStyle(content: string, styleMap: StyleMap) {
  const markers = [...new Set(content.match(/\bcn-[\w-]+/g) ?? [])];
  const key = [
    content,
    ...markers.map((marker) => styleMap[marker] ?? ""),
  ].join("\0");

  if (!compiledSources.has(key)) {
    const id = nextId++;
    const relevant = Object.fromEntries(
      markers.flatMap((marker) =>
        styleMap[marker] ? [[marker, styleMap[marker]]] : [],
      ),
    );
    const file = `${createHash("sha256")
      .update(COMPILE_CACHE_VERSION)
      .update("\0")
      .update(key)
      .digest("hex")}.tsx`;
    usedCacheFiles.add(file);
    const cachePath = path.join(COMPILE_CACHE_PATH, file);
    compiledSources.set(
      key,
      fs.readFile(cachePath, "utf8").catch(async () => {
        const result = await new Promise<string>((resolve) => {
          pending.set(id, resolve);
          workers[id % workers.length]!.postMessage({
            id,
            content,
            styleMap: relevant,
          });
        });
        await fs.mkdir(COMPILE_CACHE_PATH, { recursive: true });
        await fs.writeFile(cachePath, result);
        return result;
      }),
    );
  }
  return compiledSources.get(key)!;
}

async function buildPublicItems() {
  const styleMaps = await getStyleMaps();

  for (const base of BASES) {
    const baseName = base.name as RegistryBase;
    const registry = registries[baseName];
    const baseSrcRoot = path.join(process.cwd(), "registry", "bases", baseName);

    const items = registry.items.filter(
      (item) =>
        REGISTRY_INDEX_WHITELIST.includes(item.type) && item.name !== "index",
    );

    await Promise.all(
      items.map(async (item) => {
        const sources = (
          await Promise.all(
            (item.files ?? []).map(async (_file) => {
              const file =
                typeof _file === "string"
                  ? { path: _file, type: item.type, target: "" }
                  : _file;

              let content: string;
              try {
                content = (
                  await fs.readFile(path.join(baseSrcRoot, file.path), "utf8")
                ).replaceAll(
                  `@/registry/bases/${baseName}/ui-rtl/`,
                  `@/registry/bases/${baseName}/ui/`,
                );
              } catch {
                return null;
              }

              return {
                path: file.path,
                type: file.type,
                content,
                target: (file as { target?: string }).target ?? "",
              };
            }),
          )
        ).filter((file): file is NonNullable<typeof file> => file !== null);

        const dependencies = getItemDependencies(
          item,
          sources.map((file) => file.content),
        );
        itemDependencyCache.set(`${baseName}:${item.name}`, dependencies);

        await Promise.all(
          STYLES.map(async (style) => {
            const styleDir = path.join(
              STYLES_PATH,
              `${baseName}-${style.name}`,
            );
            await fs.mkdir(styleDir, { recursive: true });

            const styleMap = styleMaps.get(style.name)!;
            const files = await Promise.all(
              sources.map(async (file) =>
                file.content.includes("cn-")
                  ? {
                      ...file,
                      content: await compileStyle(file.content, styleMap),
                    }
                  : file,
              ),
            );

            await fs.writeFile(
              path.join(styleDir, `${item.name}.json`),
              JSON.stringify(
                { ...item, files, ...(dependencies && { dependencies }) },
                null,
                2,
              ),
              "utf8",
            );
          }),
        );
      }),
    );
  }
}

// ----------------------------------------------------------------------------
// Build registry/bases/{base}/ui-rtl for the *-rtl-demo examples: the ui files
// they import, compiled with the default style and run through the shadcn rtl
// transform. Gitignored.
// ----------------------------------------------------------------------------
const FILE_HEADER = /^\/\*\*[\s\S]*?\*\/\n\n?/;

// ----------------------------------------------------------------------------
// Build styles/{base}-{DEFAULT_STYLE}/ui: every ui file compiled with the
// default style, for the docs' own UI so it ignores the style switcher.
// Gitignored.
// ----------------------------------------------------------------------------
async function buildDocsUi() {
  const styleMap = (await getStyleMaps()).get(DEFAULT_STYLE)!;

  for (const base of BASES) {
    const baseName = base.name as RegistryBase;
    const uiDir = path.join(process.cwd(), "registry", "bases", baseName, "ui");
    const outDir = path.join(
      process.cwd(),
      "styles",
      `${baseName}-${DEFAULT_STYLE}`,
      "ui",
    );

    await rimraf(outDir);
    await fs.mkdir(outDir, { recursive: true });

    const files = (await fs.readdir(uiDir)).filter((file) =>
      file.endsWith(".tsx"),
    );
    await Promise.all(
      files.map(async (file) => {
        const source = await fs.readFile(path.join(uiDir, file), "utf8");
        const content = await compileStyle(source, styleMap);
        await fs.writeFile(
          path.join(outDir, file),
          content.replaceAll(
            `@/registry/bases/${baseName}/ui/`,
            `@/styles/${baseName}-${DEFAULT_STYLE}/ui/`,
          ),
        );
      }),
    );
  }
}

async function buildRtlUi() {
  const styleMap = (await getStyleMaps()).get(DEFAULT_STYLE)!;

  for (const base of BASES) {
    const baseName = base.name as RegistryBase;
    const baseDir = path.join(process.cwd(), "registry", "bases", baseName);
    const rtlDir = path.join(baseDir, "ui-rtl");
    const uiImport = new RegExp(
      `@/registry/bases/${baseName}/ui/([\\w-]+)`,
      "g",
    );
    const rtlImport = new RegExp(
      `@/registry/bases/${baseName}/ui-rtl/([\\w-]+)`,
      "g",
    );

    const queue: string[] = [];
    for (const file of await fs.readdir(path.join(baseDir, "examples"))) {
      if (!file.endsWith("-rtl-demo.tsx")) continue;

      const content = await fs.readFile(
        path.join(baseDir, "examples", file),
        "utf8",
      );
      for (const [, name] of content.matchAll(rtlImport)) {
        if (name) queue.push(name);
      }
    }

    await rimraf(rtlDir);
    await fs.mkdir(rtlDir, { recursive: true });

    const built = new Set<string>();
    while (queue.length > 0) {
      const name = queue.pop();
      if (!name || built.has(name)) continue;
      built.add(name);

      const source = await fs.readFile(
        path.join(baseDir, "ui", `${name}.tsx`),
        "utf8",
      );
      const header = source.match(FILE_HEADER)?.[0] ?? "";
      const content = await transformDirection(
        await compileStyle(source.slice(header.length), styleMap),
        true,
      );

      await fs.writeFile(
        path.join(rtlDir, `${name}.tsx`),
        header +
          content.replace(uiImport, (_, dependency: string) => {
            queue.push(dependency);
            return `@/registry/bases/${baseName}/ui-rtl/${dependency}`;
          }),
      );
    }
  }
}

try {
  const totalStart = performance.now();

  // Validate all registries before touching any output
  for (const base of BASES) {
    const baseName = base.name as RegistryBase;
    const result = registrySchema.safeParse(registries[baseName]);
    if (!result.success) {
      console.error(`Error in ${baseName} registry:`, result.error);
      process.exit(1);
    }
  }

  console.log("🎨 Building style maps...");
  await Promise.all([writeStyleMapsModule(), writeIconsModule()]);

  console.log("↔️  Building ui-rtl...");
  await buildRtlUi();

  console.log("📚 Building docs ui...");
  await buildDocsUi();

  if (process.argv.includes("--styles")) {
    await Promise.all(workers.map((worker) => worker.terminate()));
    process.exit(0);
  }

  console.log("🧹 Cleaning styles output directory...");
  await rimraf(STYLES_PATH);
  await fs.mkdir(STYLES_PATH, { recursive: true });

  console.log("📦 Building styles index...");
  await buildStylesIndex();

  console.log("📋 Building public/r/index.json...");
  await buildRootIndex();

  console.log(`💅 Building ${STYLE_COMBINATIONS.length} style variants...`);

  // Build per-item JSONs (once per base, then copy across styles)
  await buildPublicItems();

  // Write registry.json + index.json metadata for each style directory.
  // Runs after buildPublicItems so it correctly overwrites anything shadcn may have written.
  await buildRegistryJson();

  for (const style of STYLE_COMBINATIONS) {
    console.log(`   ✅ ${style.name}`);
  }

  const cached = await fs.readdir(COMPILE_CACHE_PATH).catch(() => []);
  await Promise.all(
    cached
      .filter((file) => !usedCacheFiles.has(file))
      .map((file) => fs.rm(path.join(COMPILE_CACHE_PATH, file))),
  );

  const elapsed = ((performance.now() - totalStart) / 1000).toFixed(2);
  console.log(`\n✅ Build complete in ${elapsed}s!`);
  await Promise.all(workers.map((worker) => worker.terminate()));
} catch (error) {
  console.error(error);
  process.exit(1);
}
