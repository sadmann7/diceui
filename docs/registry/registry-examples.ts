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
    registryDependencies: ["tags-input", "button"],
    files: [
      {
        path: "example/tags-input-editable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tags-input-sortable-demo",
    type: "registry:example",
    dependencies: [
      "@diceui/tags-input",
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    registryDependencies: ["tags-input", "sortable", "button"],
    files: [
      {
        path: "example/tags-input-sortable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tags-input-validation-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    registryDependencies: ["tags-input", "button"],
    files: [
      {
        path: "example/tags-input-validation-demo.tsx",
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
  {
    name: "sortable-multi-container-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
    registryDependencies: ["card", "button", "skeleton"],
    files: [
      {
        path: "example/sortable-multi-container-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-group-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "example/checkbox-group-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-group-animated-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "example/checkbox-group-animated-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-group-horizontal-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "example/checkbox-group-horizontal-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-group-validation-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "example/checkbox-group-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
