import type { Registry } from "@/registry/schema";

export const ui: Registry = [
  {
    name: "checkbox-group",
    type: "registry:ui",
    dependencies: ["@diceui/checkbox-group"],
    files: [
      {
        path: "ui/checkbox-group.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "combobox",
    type: "registry:ui",
    dependencies: [
      "@diceui/combobox",
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
    ],
    files: [
      {
        path: "ui/combobox.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "editable",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/editable.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/composition.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "kanban",
    type: "registry:ui",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
    ],
    files: [
      {
        path: "ui/kanban.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/composition.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "masonry",
    type: "registry:ui",
    dependencies: ["@diceui/masonry", "@radix-ui/react-slot"],
    files: [
      {
        path: "ui/masonry.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/composition.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "mention",
    type: "registry:ui",
    dependencies: ["@diceui/mention", "lucide-react"],
    files: [
      {
        path: "ui/mention.tsx",
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
    files: [
      {
        path: "ui/sortable.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/composition.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "tags-input",
    type: "registry:ui",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    files: [
      {
        path: "ui/tags-input.tsx",
        type: "registry:ui",
      },
    ],
  },
];
