import type { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "tags-input-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    files: [
      {
        path: "example/tags-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tags-input-editable-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    files: [
      {
        path: "example/tags-input-editable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "sortable-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
    registryDependencies: ["button"],
    files: [
      {
        path: "example/sortable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "sortable-grip-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "lucide-react",
    ],
    registryDependencies: ["button", "table"],
    files: [
      {
        path: "example/sortable-grip-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
