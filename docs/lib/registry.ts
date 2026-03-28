import fs from "node:fs";
import path from "node:path";

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

export function getRegistryItem(
  name: string,
  base = "radix",
  fileName?: string,
): { files: [{ content: string; path: string }] } | null {
  const filePath = resolveSourcePath(name, base, fileName);
  if (!filePath) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const cwd = process.cwd();
    const relative = filePath
      .replace(path.join(cwd, `registry/bases/${base}/`), "")
      .replaceAll("\\", "/");
    return { files: [{ content: normalizeSource(raw, base), path: relative }] };
  } catch {
    return null;
  }
}
