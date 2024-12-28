import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
  },
  plugins: [tsconfigPaths(), react()],
});
