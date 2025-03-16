import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  splitting: true,
  treeshake: true,
  tsconfig: "tsconfig.json",
  async onSuccess() {
    // Add 'use client' directive as it was removed during treeshaking
    const filePath = join("dist", "index.js");
    const contents = await readFile(filePath, "utf-8");
    await writeFile(filePath, `'use client';\n\n${contents}`);

    const filePathCjs = join("dist", "index.cjs");
    const contentsCjs = await readFile(filePathCjs, "utf-8");
    await writeFile(filePathCjs, `'use client';\n\n${contentsCjs}`);
  },
});
