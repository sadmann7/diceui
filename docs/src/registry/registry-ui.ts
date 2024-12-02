import type { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "tags-input",
    type: "registry:ui",
    dependencies: ["@diceui/tags-input"],
    files: [
      {
        path: "ui/tags-input.tsx",
        type: "registry:ui",
      },
    ],
  },
];
