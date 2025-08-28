import type { Registry } from "shadcn/registry";

export const examples: Registry["items"] = [
  {
    name: "checkbox-group-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    files: [
      {
        path: "examples/checkbox-group-demo.tsx",
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
        path: "examples/checkbox-group-animated-demo.tsx",
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
        path: "examples/checkbox-group-horizontal-demo.tsx",
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
        path: "examples/checkbox-group-multi-selection-demo.tsx",
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
        path: "examples/checkbox-group-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-picker-demo",
    type: "registry:example",
    registryDependencies: ["color-picker"],
    files: [
      {
        path: "examples/color-picker-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-picker-controlled-demo",
    type: "registry:example",
    registryDependencies: ["color-picker", "button"],
    files: [
      {
        path: "examples/color-picker-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-picker-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers/zod", "react-hook-form", "zod"],
    registryDependencies: ["button", "color-picker", "form"],
    files: [
      {
        path: "examples/color-picker-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-picker-inline-demo",
    type: "registry:example",
    registryDependencies: ["color-picker"],
    files: [
      {
        path: "examples/color-picker-inline-demo.tsx",
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
        path: "examples/combobox-demo.tsx",
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
        path: "examples/combobox-custom-filter-demo.tsx",
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
        path: "examples/combobox-debounced-demo.tsx",
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
        path: "examples/combobox-groups-demo.tsx",
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
        path: "examples/combobox-multiple-demo.tsx",
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
        path: "examples/combobox-tags-demo.tsx",
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
        path: "examples/combobox-virtualized-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "data-table-demo",
    type: "registry:example",
    dependencies: ["@diceui/data-table", "lucide-react"],
    registryDependencies: ["data-table"],
    files: [
      {
        path: "examples/data-table-demo.tsx",
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
        path: "examples/editable-demo.tsx",
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
        path: "examples/editable-autosize-demo.tsx",
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
        path: "examples/editable-double-click-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-form-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "@diceui/form"],
    registryDependencies: ["button", "form"],
    files: [
      {
        path: "examples/editable-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-todo-list-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["checkbox", "button"],
    files: [
      {
        path: "examples/editable-todo-list-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "sonner"],
    registryDependencies: ["button"],
    files: [
      {
        path: "examples/file-upload-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-chat-input-demo",
    type: "registry:example",
    dependencies: [
      "@radix-ui/react-slot",
      "lucide-react",
      "sonner",
      "uploadthing",
      "@uploadthing/react",
    ],
    registryDependencies: [
      "button",
      "textarea",
      "file-upload",
      "lucide-react",
      "sonner",
    ],
    files: [
      {
        path: "examples/file-upload-chat-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-circular-progress-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: ["button", "lucide-react", "sonner"],
    files: [
      {
        path: "examples/file-upload-circular-progress-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-direct-upload-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "sonner"],
    registryDependencies: ["button"],
    files: [
      {
        path: "examples/file-upload-direct-upload-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-fill-progress-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: ["button", "lucide-react", "sonner"],
    files: [
      {
        path: "examples/file-upload-fill-progress-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-form-demo",
    type: "registry:example",
    dependencies: [
      "@radix-ui/react-slot",
      "lucide-react",
      "@hookform/resolvers/zod",
      "zod",
    ],
    registryDependencies: ["button", "form", "lucide-react", "sonner"],
    files: [
      {
        path: "examples/file-upload-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-uploadthing-demo",
    type: "registry:example",
    dependencies: [
      "@radix-ui/react-slot",
      "lucide-react",
      "uploadthing",
      "@uploadthing/react",
    ],
    registryDependencies: ["button", "lucide-react", "sonner"],
    files: [
      {
        path: "examples/file-upload-uploadthing-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "file-upload-validation-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "sonner"],
    registryDependencies: ["button"],
    files: [
      {
        path: "examples/file-upload-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "input-group-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["input-group"],
    files: [
      {
        path: "examples/input-group-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "input-group-form-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["button", "input-group"],
    files: [
      {
        path: "examples/input-group-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "input-group-rgb-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["input-group"],
    files: [
      {
        path: "examples/input-group-rgb-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "input-group-vertical-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["input-group"],
    files: [
      {
        path: "examples/input-group-vertical-demo.tsx",
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
        path: "examples/kanban-demo.tsx",
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
        path: "examples/kanban-dynamic-overlay-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/kbd-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-multiple-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/kbd-multiple-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "kbd-variants-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/kbd-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "listbox-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/listbox-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "listbox-grid-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/listbox-grid-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "listbox-group-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/listbox-group-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "listbox-horizontal-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/listbox-horizontal-demo.tsx",
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
        path: "examples/masonry-demo.tsx",
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
        path: "examples/masonry-linear-demo.tsx",
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
        path: "examples/masonry-ssr-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: ["button", "select", "slider", "tooltip"],
    files: [
      {
        path: "examples/media-player-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-audio-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: ["button", "select", "slider", "tooltip"],
    files: [
      {
        path: "examples/media-player-audio-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-error-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: ["button", "slider", "tooltip"],
    files: [
      {
        path: "examples/media-player-error-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-hls-demo",
    type: "registry:example",
    dependencies: [
      "@radix-ui/react-slot",
      "lucide-react",
      "media-chrome",
      "@mux/mux-video-react",
    ],
    registryDependencies: ["button", "select", "slider", "tooltip"],
    files: [
      {
        path: "examples/media-player-hls-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-playlist-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: ["button", "scroll-area", "media-player"],
    files: [
      {
        path: "examples/media-player-playlist-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "media-player-settings-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: [
      "badge",
      "button",
      "dropdown-menu",
      "select",
      "slider",
      "tooltip",
    ],
    files: [
      {
        path: "examples/media-player-settings-demo.tsx",
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
        path: "examples/mention-demo.tsx",
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
        path: "examples/mention-custom-filter-demo.tsx",
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
        path: "examples/mention-custom-trigger-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-demo",
    type: "registry:example",
    registryDependencies: ["button", "hover-card"],
    files: [
      {
        path: "examples/relative-time-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-timezones-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["hover-card"],
    files: [
      {
        path: "examples/relative-time-card-timezones-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-variants-demo",
    type: "registry:example",
    registryDependencies: ["button", "hover-card"],
    files: [
      {
        path: "examples/relative-time-card-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroller-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "examples/scroller-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroller-hidden-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "examples/scroller-hidden-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroller-horizontal-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "examples/scroller-horizontal-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroller-navigation-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "examples/scroller-navigation-demo.tsx",
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
        path: "examples/sortable-demo.tsx",
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
        path: "examples/sortable-dynamic-overlay-demo.tsx",
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
        path: "examples/sortable-handle-demo.tsx",
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
        path: "examples/sortable-primitive-values-demo.tsx",
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
        path: "examples/tags-input-demo.tsx",
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
        path: "examples/tags-input-editable-demo.tsx",
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
        path: "examples/tags-input-sortable-demo.tsx",
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
        path: "examples/tags-input-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
