import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["esm"],
  dts: true,
  outDir: "dist",
  tsconfig: "tsconfig.json",
  inputOptions: {
    transform: {
      jsx: "react-jsx",
    },
  },
  banner: {
    js: "'use client';",
  },
});
