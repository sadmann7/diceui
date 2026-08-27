import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(__dirname, "./vitest.setup.ts")],
    include: ["**/*.test.?(c|m)[jt]s?(x)"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  plugins: [tsconfigPaths(), react()],
});
