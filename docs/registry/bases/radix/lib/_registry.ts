import type { Registry } from "shadcn/schema";

export const lib: Registry["items"] = [
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
    name: "compose-refs",
    type: "registry:lib",
    files: [
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
];
