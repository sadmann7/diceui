import type { Registry } from "@/registry/schema";

export const examples: Registry = [
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
  {
    name: "checkbox-group-multi-selection-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "example/checkbox-group-multi-selection-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-groups-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-groups-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-multiple-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-multiple-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-custom-filter-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-custom-filter-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-debounced-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-debounced-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-virtualized-demo",
    type: "registry:example",
    dependencies: [
      "@diceui/combobox",
      "@tanstack/react-virtual",
      "lucide-react",
    ],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "example/combobox-virtualized-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-tags-demo",
    type: "registry:example",
    dependencies: ["@diceui/combobox", "@diceui/tags-input", "lucide-react"],
    registryDependencies: ["combobox", "tags-input"],
    files: [
      {
        path: "example/combobox-tags-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["button"],
    files: [
      {
        path: "example/editable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-double-click-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["button"],
    files: [
      {
        path: "example/editable-double-click-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-autosize-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["button"],
    files: [
      {
        path: "example/editable-autosize-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kanban-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    registryDependencies: ["badge", "button"],
    files: [
      {
        path: "example/kanban-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kanban-dynamic-overlay-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    registryDependencies: ["badge", "button"],
    files: [
      {
        path: "example/kanban-dynamic-overlay-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "masonry-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "example/masonry-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "masonry-responsive-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["skeleton"],
    files: [
      {
        path: "example/masonry-responsive-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "masonry-linear-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["skeleton"],
    files: [
      {
        path: "example/masonry-linear-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "masonry-ssr-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["skeleton"],
    files: [
      {
        path: "example/masonry-ssr-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mention-demo",
    type: "registry:example",
    dependencies: ["@diceui/mention", "lucide-react"],
    registryDependencies: ["mention"],
    files: [
      {
        path: "example/mention-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mention-custom-filter-demo",
    type: "registry:example",
    dependencies: ["@diceui/mention", "lucide-react"],
    registryDependencies: ["mention"],
    files: [
      {
        path: "example/mention-custom-filter-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mention-custom-trigger-demo",
    type: "registry:example",
    dependencies: ["@diceui/mention", "lucide-react"],
    registryDependencies: ["mention"],
    files: [
      {
        path: "example/mention-custom-trigger-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-demo",
    type: "registry:example",
    files: [
      {
        path: "example/kbd-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-variants-demo",
    type: "registry:example",
    files: [
      {
        path: "example/kbd-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-multiple-demo",
    type: "registry:example",
    files: [
      {
        path: "example/kbd-multiple-demo.tsx",
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
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    files: [
      {
        path: "example/sortable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "sortable-dynamic-overlay-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    files: [
      {
        path: "example/sortable-dynamic-overlay-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "sortable-primitive-values-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    files: [
      {
        path: "example/sortable-primitive-values-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "sortable-handle-demo",
    type: "registry:example",
    dependencies: [
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@radix-ui/react-slot",
      "lucide-react",
    ],
    registryDependencies: ["button", "table"],
    files: [
      {
        path: "example/sortable-handle-demo.tsx",
        type: "registry:example",
      },
    ],
  },
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
];
