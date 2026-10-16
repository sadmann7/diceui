import fs from "node:fs";
import path from "node:path";
import { transformStyle } from "shadcn/utils";

import { DEFAULT_BASE, DEFAULT_STYLE } from "@/lib/constants";
import { STYLE_MAPS } from "@/registry/styles/__generated__/style-maps";

const SOURCE_DIRS = ["ui", "components", "lib", "hooks", "internal"];
const SOURCE_EXTENSIONS = [".tsx", ".ts"];

export function normalizeSource(source: string, base: string): string {
  return source
    .replaceAll(`@/registry/bases/${base}/`, "@/components/")
    .replaceAll("export default", "export");
}

function resolveSourcePath(
  name: string,
  base: string,
  fileName?: string,
): string | null {
  const cwd = process.cwd();

  if (fileName) {
    const candidates = SOURCE_EXTENSIONS.flatMap((ext) =>
      SOURCE_DIRS.map((dir) =>
        path.join(cwd, `registry/bases/${base}/${dir}/${fileName}${ext}`),
      ),
    );
    const hit = candidates.find((p) => fs.existsSync(p));
    if (hit) return hit;
  }

  const candidates = SOURCE_EXTENSIONS.flatMap((ext) =>
    SOURCE_DIRS.map((dir) =>
      path.join(cwd, `registry/bases/${base}/${dir}/${name}${ext}`),
    ),
  );
  return candidates.find((p) => fs.existsSync(p)) ?? null;
}

const compiledSources = new Map<string, Promise<string>>();

function compileSource(source: string) {
  if (!source.includes("cn-")) return source;

  if (!compiledSources.has(source)) {
    compiledSources.set(
      source,
      transformStyle(source, { styleMap: STYLE_MAPS[DEFAULT_STYLE] ?? {} }),
    );
  }
  return compiledSources.get(source)!;
}

export async function getRegistryItem(
  name: string,
  base = DEFAULT_BASE,
  fileName?: string,
): Promise<{ files: [{ content: string; path: string }] } | null> {
  const filePath = resolveSourcePath(name, base, fileName);
  if (!filePath) return null;

  try {
    const raw = await compileSource(fs.readFileSync(filePath, "utf-8"));
    const cwd = process.cwd();
    const relative = filePath
      .replace(path.join(cwd, `registry/bases/${base}/`), "")
      .replaceAll("\\", "/");
    return { files: [{ content: normalizeSource(raw, base), path: relative }] };
  } catch {
    return null;
  }
}
