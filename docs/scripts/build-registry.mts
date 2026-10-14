/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/scripts/build-registry.mts
 */

import type { z } from "zod";

import { promises as fs } from "node:fs";
import path from "node:path";
import { rimraf } from "rimraf";
import {
  type RegistryItem,
  type registryItemTypeSchema,
  registrySchema,
} from "shadcn/schema";

import { DEFAULT_BASE, DEFAULT_STYLE } from "../lib/constants";
import { BASES } from "../registry/bases";
import { type RegistryBase, registries } from "../registry/registry";
import { STYLES } from "../registry/styles";

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
//
// Runs once per base (for DEFAULT_STYLE), then copies per-item JSON files to
// the remaining style directories. Per-style copies are byte-identical so
// `{style}` in a consumer URL does not 404. Visual differences are CSS-only.
// ----------------------------------------------------------------------------
async function buildPublicItems() {
  for (const base of BASES) {
    const baseName = base.name as RegistryBase;
    const registry = registries[baseName];
    const baseSrcRoot = path.join(process.cwd(), "registry", "bases", baseName);

    // Build all per-item JSON files once, into the default style directory
    const defaultStyleDir = path.join(
      STYLES_PATH,
      `${baseName}-${DEFAULT_STYLE}`,
    );
    await fs.mkdir(defaultStyleDir, { recursive: true });

    for (const item of registry.items) {
      if (!REGISTRY_INDEX_WHITELIST.includes(item.type)) continue;
      if (item.name === "index") continue;

      const files = (
        await Promise.all(
          (item.files ?? []).map(async (_file) => {
            const file =
              typeof _file === "string"
                ? { path: _file, type: item.type, target: "" }
                : _file;

            let content: string;
            try {
              content = await fs.readFile(
                path.join(baseSrcRoot, file.path),
                "utf8",
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
        files.map((file) => file.content),
      );
      itemDependencyCache.set(`${baseName}:${item.name}`, dependencies);

      await fs.writeFile(
        path.join(defaultStyleDir, `${item.name}.json`),
        JSON.stringify(
          { ...item, files, ...(dependencies && { dependencies }) },
          null,
          2,
        ),
        "utf8",
      );
    }

    // Copy per-item JSON files to every other style directory for this base.
    for (const style of STYLES) {
      if (style.name === DEFAULT_STYLE) continue;

      const styleDir = path.join(STYLES_PATH, `${baseName}-${style.name}`);
      await fs.mkdir(styleDir, { recursive: true });

      const builtFiles = (await fs.readdir(defaultStyleDir)).filter(
        (f) =>
          f.endsWith(".json") && f !== "registry.json" && f !== "index.json",
      );

      await Promise.all(
        builtFiles.map((file) =>
          fs.copyFile(
            path.join(defaultStyleDir, file),
            path.join(styleDir, file),
          ),
        ),
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

  const elapsed = ((performance.now() - totalStart) / 1000).toFixed(2);
  console.log(`\n✅ Build complete in ${elapsed}s!`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
