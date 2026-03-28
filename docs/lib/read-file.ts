import fs from "node:fs";
import path from "node:path";

export function readFileFromRoot(filePath: string): string {
  const fullPath = path.isAbsolute(filePath)
    ? filePath
    : path.join(process.cwd(), filePath);
  return fs.readFileSync(fullPath, "utf-8");
}
