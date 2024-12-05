import type { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "tags-input",
    type: "registry:ui",
    dependencies: ["@diceui/tags-input", "@radix-ui/react-slot"],
    registryDependencies: ["button"],
    files: [
      {
        path: "ui/tags-input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "sortable",
    type: "registry:ui",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
    ],
    registryDependencies: ["button"],
    files: [
      {
        path: "ui/sortable.tsx",
        type: "registry:ui",
      },
    ],
  },
];
