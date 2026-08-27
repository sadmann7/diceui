import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/listbox.tsx",
  },
  format: ["esm", "cjs"],
  dts: true,
  outDir: "dist",
  tsconfig: "tsconfig.json",
  banner: {
    js: "'use client';",
  },
});
