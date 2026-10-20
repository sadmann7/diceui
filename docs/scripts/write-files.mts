import { promises as fs } from "node:fs";
import path from "node:path";

// The rename keeps the dev server from reading a half-written file.
export async function writeFileIfChanged(file: string, content: string) {
  const current = await fs.readFile(file, "utf8").catch(() => null);
  if (current === content) return false;

  const dir = path.dirname(file);
  const temp = path.join(dir, `.${path.basename(file)}.${process.pid}.tmp`);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(temp, content);
  await fs.rename(temp, file);
  return true;
}

export async function removeStaleFiles(dir: string, keep: Set<string>) {
  const entries = await fs.readdir(dir).catch(() => []);
  await Promise.all(
    entries
      .filter((entry) => !keep.has(entry))
      .map((entry) =>
        fs.rm(path.join(dir, entry), { recursive: true, force: true }),
      ),
  );
}
