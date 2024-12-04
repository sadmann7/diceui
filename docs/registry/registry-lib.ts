import type { Registry } from "@/registry/schema";

export const lib: Registry = [
  {
    name: "utils",
    type: "registry:lib",
    dependencies: ["clsx", "tailwind-merge"],
    files: [
      {
        path: "lib/utils.ts",
        type: "registry:lib",
      },
      {
        path: "lib/compose-event-handlers.ts",
        type: "registry:lib",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
];
