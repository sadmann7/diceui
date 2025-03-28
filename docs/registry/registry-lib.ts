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
    ],
  },
  {
    name: "composition",
    type: "registry:lib",
    files: [
      {
        path: "lib/composition.ts",
        type: "registry:lib",
      },
    ],
  },
];
