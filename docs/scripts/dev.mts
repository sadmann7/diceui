import { spawn } from "node:child_process";

import { writeIconsModule } from "./build-icons.mts";
import { watchStyleMaps, writeStyleMapsModule } from "./style-maps.mts";

// Generate before starting Next so the first compile can resolve the modules,
// then keep the watchers in this process. A shell `&` would block on Windows.
await Promise.all([writeStyleMapsModule(), writeIconsModule()]);
watchStyleMaps();

const next = spawn("next", ["dev", "--turbopack", ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});

next.on("exit", (code, signal) => {
  process.exit(code ?? (signal ? 1 : 0));
});
