import { promises as fs } from "node:fs";
import path from "node:path";
import { transformDirection } from "shadcn/utils";

import type { RegistryBase } from "../registry/registry";

const FILE_HEADER = /^\/\*\*[\s\S]*?\*\/\n\n?/;

export function getRtlDir(root: string, base: RegistryBase) {
  return path.join(root, "registry", "bases", base, "ui-rtl");
}

export async function getRtlFiles(root: string, base: RegistryBase) {
  const baseDir = path.join(root, "registry", "bases", base);
  const uiImport = new RegExp(`@/registry/bases/${base}/ui/([\\w-]+)`, "g");
  const rtlImport = new RegExp(
    `@/registry/bases/${base}/ui-rtl/([\\w-]+)`,
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

  const files = new Map<string, string>();
  while (queue.length > 0) {
    const name = queue.pop();
    if (!name || files.has(name)) continue;

    const source = await fs.readFile(
      path.join(baseDir, "ui", `${name}.tsx`),
      "utf8",
    );
    const header = source.match(FILE_HEADER)?.[0] ?? "";
    const content = await transformDirection(source.slice(header.length), true);

    files.set(
      `${name}.tsx`,
      header +
        content.replace(uiImport, (_, dependency: string) => {
          queue.push(dependency);
          return `@/registry/bases/${base}/ui-rtl/${dependency}`;
        }),
    );
  }

  return files;
}
