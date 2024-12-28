import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
  },
  plugins: [tsconfigPaths()],
});
