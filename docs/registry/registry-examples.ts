import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    name: "action-bar-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["action-bar", "checkbox"],
    files: [
      {
        path: "examples/action-bar-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "action-bar-position-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["action-bar", "label", "select", "switch"],
    files: [
      {
        path: "examples/action-bar-position-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "angle-slider-demo",
    type: "registry:example",
    registryDependencies: ["angle-slider"],
    files: [
      {
        path: "examples/angle-slider-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "angle-slider-controlled-demo",
    type: "registry:example",
    dependencies: ["motion", "lucide-react"],
    registryDependencies: ["angle-slider", "button"],
    files: [
      {
        path: "examples/angle-slider-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "angle-slider-range-demo",
    type: "registry:example",
    registryDependencies: ["angle-slider"],
    files: [
      {
        path: "examples/angle-slider-range-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "angle-slider-themes-demo",
    type: "registry:example",
    registryDependencies: ["angle-slider"],
    files: [
      {
        path: "examples/angle-slider-themes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "angle-slider-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers", "react-hook-form", "zod", "sonner"],
    registryDependencies: ["angle-slider", "button", "form"],
    files: [
      {
        path: "examples/angle-slider-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "avatar-group-demo",
    type: "registry:example",
    registryDependencies: ["avatar", "avatar-group"],
    files: [
      {
        path: "examples/avatar-group-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "avatar-group-truncation-demo",
    type: "registry:example",
    registryDependencies: ["avatar", "avatar-group"],
    files: [
      {
        path: "examples/avatar-group-truncation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "avatar-group-rtl-demo",
    type: "registry:example",
    registryDependencies: ["avatar", "avatar-group"],
    files: [
      {
        path: "examples/avatar-group-rtl-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "avatar-group-icons-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["avatar-group"],
    files: [
      {
        path: "examples/avatar-group-icons-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "avatar-group-custom-overflow-demo",
    type: "registry:example",
    registryDependencies: ["avatar", "avatar-group"],
    files: [
      {
        path: "examples/avatar-group-custom-overflow-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "badge-overflow-demo",
    type: "registry:example",
    registryDependencies: ["badge", "badge-overflow"],
    files: [
      {
        path: "examples/badge-overflow-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "badge-overflow-multiline-demo",
    type: "registry:example",
    registryDependencies: ["badge", "badge-overflow"],
    files: [
      {
        path: "examples/badge-overflow-multiline-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "badge-overflow-interactive-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["badge", "badge-overflow", "button", "input"],
    files: [
      {
        path: "examples/badge-overflow-interactive-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "checkbox-group-demo",
    type: "registry:example",
    dependencies: ["@diceui/checkbox-group", "lucide-react"],
    registryDependencies: ["checkbox-group"],
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
    registryDependencies: ["checkbox-group"],
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
    registryDependencies: ["checkbox-group"],
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
    registryDependencies: ["checkbox-group"],
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
    registryDependencies: ["checkbox-group"],
    files: [
      {
        path: "examples/checkbox-group-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "circular-progress-demo",
    type: "registry:example",
    registryDependencies: ["circular-progress"],
    files: [
      {
        path: "examples/circular-progress-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "circular-progress-interactive-demo",
    type: "registry:example",
    registryDependencies: ["button", "circular-progress"],
    files: [
      {
        path: "examples/circular-progress-interactive-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "circular-progress-colors-demo",
    type: "registry:example",
    dependencies: ["motion"],
    registryDependencies: ["circular-progress"],
    files: [
      {
        path: "examples/circular-progress-colors-demo.tsx",
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
    registryDependencies: ["color-picker", "button", "form"],
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
    name: "color-swatch-demo",
    type: "registry:example",
    registryDependencies: ["color-swatch"],
    files: [
      {
        path: "examples/color-swatch-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-swatch-sizes-demo",
    type: "registry:example",
    registryDependencies: ["color-swatch"],
    files: [
      {
        path: "examples/color-swatch-sizes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "color-swatch-transparency-demo",
    type: "registry:example",
    registryDependencies: ["color-swatch"],
    files: [
      {
        path: "examples/color-swatch-transparency-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "combobox-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
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
    dependencies: ["lucide-react"],
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
    dependencies: ["lucide-react"],
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
    dependencies: ["lucide-react"],
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
    dependencies: ["lucide-react"],
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
    dependencies: ["lucide-react"],
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
    dependencies: ["@tanstack/react-virtual", "lucide-react"],
    registryDependencies: ["combobox"],
    files: [
      {
        path: "examples/combobox-virtualized-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "compare-slider-demo",
    type: "registry:example",
    registryDependencies: ["compare-slider"],
    files: [
      {
        path: "examples/compare-slider-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "compare-slider-controlled-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["compare-slider", "button", "label", "slider"],
    files: [
      {
        path: "examples/compare-slider-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "compare-slider-customization-demo",
    type: "registry:example",
    registryDependencies: ["compare-slider"],
    files: [
      {
        path: "examples/compare-slider-customization-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "compare-slider-vertical-demo",
    type: "registry:example",
    registryDependencies: ["compare-slider"],
    files: [
      {
        path: "examples/compare-slider-vertical-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "cropper-demo",
    type: "registry:example",
    registryDependencies: ["cropper"],
    files: [
      {
        path: "examples/cropper-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "cropper-controlled-demo",
    type: "registry:example",
    registryDependencies: ["cropper", "button", "label", "slider"],
    files: [
      {
        path: "examples/cropper-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "cropper-file-upload-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers", "react-hook-form", "zod"],
    registryDependencies: ["cropper", "button", "dialog", "label", "slider"],
    files: [
      {
        path: "examples/cropper-file-upload-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "cropper-shapes-demo",
    type: "registry:example",
    registryDependencies: ["cropper", "label", "select", "switch"],
    files: [
      {
        path: "examples/cropper-shapes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "cropper-video-demo",
    type: "registry:example",
    registryDependencies: ["cropper", "button", "label", "select"],
    files: [
      {
        path: "examples/cropper-video-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "data-grid-demo",
    type: "registry:example",
    dependencies: [
      "@tanstack/react-table",
      "@tanstack/react-virtual",
      "lucide-react",
      "sonner",
    ],
    devDependencies: ["@faker-js/faker"],
    registryDependencies: ["data-grid"],
    files: [
      {
        path: "examples/data-grid-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "data-table-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
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
    registryDependencies: ["button", "editable"],
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
    registryDependencies: ["button", "editable"],
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
    registryDependencies: ["button", "editable"],
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
    registryDependencies: ["button", "editable", "form"],
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
    registryDependencies: ["button", "checkbox", "editable"],
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
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["button", "file-upload"],
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
      "lucide-react",
      "sonner",
      "uploadthing",
      "@uploadthing/react",
    ],
    registryDependencies: ["button", "file-upload", "textarea"],
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
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "file-upload"],
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
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["button", "file-upload"],
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
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "file-upload"],
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
    dependencies: ["lucide-react", "@hookform/resolvers/zod", "zod"],
    registryDependencies: ["button", "file-upload", "form"],
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
    dependencies: ["lucide-react", "uploadthing", "@uploadthing/react"],
    registryDependencies: ["button", "file-upload"],
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
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["button", "file-upload"],
    files: [
      {
        path: "examples/file-upload-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "fps-demo",
    type: "registry:example",
    registryDependencies: ["fps"],
    files: [
      {
        path: "examples/fps-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "fps-strategy-demo",
    type: "registry:example",
    registryDependencies: ["fps"],
    files: [
      {
        path: "examples/fps-strategy-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "gauge-demo",
    type: "registry:example",
    registryDependencies: ["gauge"],
    files: [
      {
        path: "examples/gauge-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "gauge-sizes-demo",
    type: "registry:example",
    registryDependencies: ["gauge"],
    files: [
      {
        path: "examples/gauge-sizes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "gauge-colors-demo",
    type: "registry:example",
    registryDependencies: ["gauge"],
    files: [
      {
        path: "examples/gauge-colors-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "gauge-variants-demo",
    type: "registry:example",
    registryDependencies: ["gauge"],
    files: [
      {
        path: "examples/gauge-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hitbox-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["checkbox", "hitbox"],
    files: [
      {
        path: "examples/hitbox-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hitbox-sizes-demo",
    type: "registry:example",
    registryDependencies: ["checkbox", "hitbox"],
    files: [
      {
        path: "examples/hitbox-sizes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hitbox-positions-demo",
    type: "registry:example",
    registryDependencies: ["checkbox", "hitbox"],
    files: [
      {
        path: "examples/hitbox-positions-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hitbox-radii-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["checkbox", "hitbox"],
    files: [
      {
        path: "examples/hitbox-radii-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "hitbox-debug-demo",
    type: "registry:example",
    registryDependencies: ["button", "hitbox"],
    files: [
      {
        path: "examples/hitbox-debug-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "segmented-input-demo",
    type: "registry:example",
    registryDependencies: ["segmented-input"],
    files: [
      {
        path: "examples/segmented-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "selection-toolbar-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["selection-toolbar"],
    files: [
      {
        path: "examples/selection-toolbar-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "selection-toolbar-info-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["selection-toolbar"],
    files: [
      {
        path: "examples/selection-toolbar-info-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "segmented-input-form-demo",
    type: "registry:example",
    registryDependencies: ["button", "segmented-input"],
    files: [
      {
        path: "examples/segmented-input-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "segmented-input-rgb-demo",
    type: "registry:example",
    registryDependencies: ["segmented-input"],
    files: [
      {
        path: "examples/segmented-input-rgb-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "segmented-input-vertical-demo",
    type: "registry:example",
    registryDependencies: ["segmented-input"],
    files: [
      {
        path: "examples/segmented-input-vertical-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "marquee-demo",
    type: "registry:example",
    registryDependencies: ["marquee"],
    files: [
      {
        path: "examples/marquee-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "marquee-logo-demo",
    type: "registry:example",
    registryDependencies: ["marquee"],
    files: [
      {
        path: "examples/marquee-logo-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "marquee-vertical-demo",
    type: "registry:example",
    registryDependencies: ["marquee"],
    files: [
      {
        path: "examples/marquee-vertical-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "marquee-rtl-demo",
    type: "registry:example",
    registryDependencies: ["marquee"],
    files: [
      {
        path: "examples/marquee-rtl-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mask-input-demo",
    type: "registry:example",
    registryDependencies: ["mask-input"],
    files: [
      {
        path: "examples/mask-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mask-input-custom-pattern-demo",
    type: "registry:example",
    registryDependencies: ["label", "mask-input"],
    files: [
      {
        path: "examples/mask-input-custom-pattern-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mask-input-validation-modes-demo",
    type: "registry:example",
    registryDependencies: ["badge", "card", "label", "mask-input"],
    files: [
      {
        path: "examples/mask-input-validation-modes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mask-input-card-information-demo",
    type: "registry:example",
    registryDependencies: ["card", "label", "mask-input"],
    files: [
      {
        path: "examples/mask-input-card-information-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "mask-input-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers/zod", "react-hook-form", "zod"],
    registryDependencies: ["button", "form", "mask-input"],
    files: [
      {
        path: "examples/mask-input-form-demo.tsx",
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
      "lucide-react",
    ],
    registryDependencies: ["badge", "button", "kanban"],
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
      "lucide-react",
    ],
    registryDependencies: ["badge", "button", "kanban"],
    files: [
      {
        path: "examples/kanban-dynamic-overlay-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "key-value-demo",
    type: "registry:example",
    registryDependencies: ["key-value"],
    files: [
      {
        path: "examples/key-value-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "key-value-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers", "react-hook-form", "zod", "sonner"],
    registryDependencies: ["key-value", "button", "form", "input"],
    files: [
      {
        path: "examples/key-value-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "key-value-validation-demo",
    type: "registry:example",
    registryDependencies: ["key-value"],
    files: [
      {
        path: "examples/key-value-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "key-value-paste-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["key-value"],
    files: [
      {
        path: "examples/key-value-paste-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "listbox-demo",
    type: "registry:example",
    registryDependencies: ["listbox"],
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
    registryDependencies: ["listbox"],
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
    registryDependencies: ["listbox"],
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
    registryDependencies: ["listbox"],
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
    registryDependencies: ["masonry"],
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
    registryDependencies: ["masonry", "skeleton"],
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
    registryDependencies: ["masonry", "skeleton"],
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
    dependencies: ["lucide-react", "media-chrome"],
    registryDependencies: [
      "button",
      "media-player",
      "select",
      "slider",
      "tooltip",
    ],
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
    dependencies: ["lucide-react", "media-chrome"],
    registryDependencies: [
      "button",
      "media-player",
      "select",
      "slider",
      "tooltip",
    ],
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
    dependencies: ["lucide-react", "media-chrome"],
    registryDependencies: ["button", "media-player", "slider", "tooltip"],
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
    dependencies: ["lucide-react", "media-chrome", "@mux/mux-video-react"],
    registryDependencies: [
      "button",
      "media-player",
      "select",
      "slider",
      "tooltip",
    ],
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
    dependencies: ["lucide-react", "media-chrome"],
    registryDependencies: ["button", "media-player", "scroll-area"],
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
    dependencies: ["lucide-react", "media-chrome"],
    registryDependencies: [
      "badge",
      "button",
      "dropdown-menu",
      "media-player",
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
    files: [
      {
        path: "examples/mention-custom-trigger-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "phone-input-demo",
    type: "registry:example",
    registryDependencies: ["phone-input"],
    files: [
      {
        path: "examples/phone-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "phone-input-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers", "react-hook-form", "zod", "sonner"],
    registryDependencies: ["phone-input", "button", "form"],
    files: [
      {
        path: "examples/phone-input-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "phone-input-custom-countries-demo",
    type: "registry:example",
    registryDependencies: ["phone-input"],
    files: [
      {
        path: "examples/phone-input-custom-countries-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "qr-code-demo",
    type: "registry:example",
    registryDependencies: ["qr-code"],
    files: [
      {
        path: "examples/qr-code-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "qr-code-customization-demo",
    type: "registry:example",
    registryDependencies: ["qr-code"],
    files: [
      {
        path: "examples/qr-code-customization-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "qr-code-formats-demo",
    type: "registry:example",
    registryDependencies: ["button", "qr-code"],
    files: [
      {
        path: "examples/qr-code-formats-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "qr-code-overlay-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["qr-code"],
    files: [
      {
        path: "examples/qr-code-overlay-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "rating-demo",
    type: "registry:example",
    registryDependencies: ["rating"],
    files: [
      {
        path: "examples/rating-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "rating-themes-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["rating"],
    files: [
      {
        path: "examples/rating-themes-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "rating-controlled-demo",
    type: "registry:example",
    registryDependencies: ["rating", "button"],
    files: [
      {
        path: "examples/rating-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "rating-form-demo",
    type: "registry:example",
    dependencies: [
      "@hookform/resolvers/zod",
      "react-hook-form",
      "zod",
      "sonner",
    ],
    registryDependencies: ["rating", "button", "form"],
    files: [
      {
        path: "examples/rating-form-demo.tsx",
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
    registryDependencies: ["hover-card", "relative-time-card"],
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
    name: "responsive-dialog-demo",
    type: "registry:example",
    registryDependencies: ["button", "input", "label", "responsive-dialog"],
    files: [
      {
        path: "examples/responsive-dialog-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "responsive-dialog-confirm-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "responsive-dialog"],
    files: [
      {
        path: "examples/responsive-dialog-confirm-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroller-demo",
    type: "registry:example",
    registryDependencies: ["scroller"],
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
    registryDependencies: ["scroller"],
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
    registryDependencies: ["scroller"],
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
    registryDependencies: ["scroller"],
    files: [
      {
        path: "examples/scroller-navigation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroll-spy-demo",
    type: "registry:example",
    registryDependencies: ["scroll-spy"],
    files: [
      {
        path: "examples/scroll-spy-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroll-spy-controlled-demo",
    type: "registry:example",
    registryDependencies: ["scroll-spy", "button"],
    files: [
      {
        path: "examples/scroll-spy-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "scroll-spy-vertical-demo",
    type: "registry:example",
    registryDependencies: ["scroll-spy"],
    files: [
      {
        path: "examples/scroll-spy-vertical-demo.tsx",
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
      "lucide-react",
    ],
    registryDependencies: ["sortable"],
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
      "lucide-react",
    ],
    registryDependencies: ["sortable"],
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
      "lucide-react",
    ],
    registryDependencies: ["button", "sortable", "table"],
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
      "lucide-react",
    ],
    registryDependencies: ["sortable"],
    files: [
      {
        path: "examples/sortable-primitive-values-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "speed-dial-demo",
    type: "registry:example",
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["speed-dial"],
    files: [
      {
        path: "examples/speed-dial-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "speed-dial-controlled-demo",
    type: "registry:example",
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["button", "speed-dial"],
    files: [
      {
        path: "examples/speed-dial-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "speed-dial-side-demo",
    type: "registry:example",
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["speed-dial"],
    files: [
      {
        path: "examples/speed-dial-side-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "speed-dial-labels-demo",
    type: "registry:example",
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["speed-dial"],
    files: [
      {
        path: "examples/speed-dial-labels-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "speed-dial-hover-demo",
    type: "registry:example",
    dependencies: ["lucide-react", "sonner"],
    registryDependencies: ["speed-dial"],
    files: [
      {
        path: "examples/speed-dial-hover-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stack-demo",
    type: "registry:example",
    registryDependencies: ["stack"],
    files: [
      {
        path: "examples/stack-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stack-no-expand-demo",
    type: "registry:example",
    registryDependencies: ["stack"],
    files: [
      {
        path: "examples/stack-no-expand-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stack-side-demo",
    type: "registry:example",
    registryDependencies: ["stack"],
    files: [
      {
        path: "examples/stack-side-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stat-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["stat", "dropdown-menu"],
    files: [
      {
        path: "examples/stat-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stat-variants-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["stat"],
    files: [
      {
        path: "examples/stat-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stat-layout-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["stat"],
    files: [
      {
        path: "examples/stat-layout-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "pending-demo",
    type: "registry:example",
    registryDependencies: ["pending", "button"],
    files: [
      {
        path: "examples/pending-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "pending-wrapper-demo",
    type: "registry:example",
    registryDependencies: ["pending", "button"],
    files: [
      {
        path: "examples/pending-wrapper-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "pending-form-demo",
    type: "registry:example",
    registryDependencies: ["pending", "button", "input", "label"],
    files: [
      {
        path: "examples/pending-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "pending-link-demo",
    type: "registry:example",
    registryDependencies: ["pending"],
    files: [
      {
        path: "examples/pending-link-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "pending-switch-demo",
    type: "registry:example",
    registryDependencies: ["pending", "switch", "label"],
    files: [
      {
        path: "examples/pending-switch-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "status-demo",
    type: "registry:example",
    registryDependencies: ["status"],
    files: [
      {
        path: "examples/status-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "status-variants-demo",
    type: "registry:example",
    registryDependencies: ["status"],
    files: [
      {
        path: "examples/status-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "status-text-only-demo",
    type: "registry:example",
    registryDependencies: ["status"],
    files: [
      {
        path: "examples/status-text-only-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "status-list-demo",
    type: "registry:example",
    registryDependencies: ["status"],
    files: [
      {
        path: "examples/status-list-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stepper-demo",
    type: "registry:example",
    registryDependencies: ["stepper"],
    files: [
      {
        path: "examples/stepper-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "swap-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["swap"],
    files: [
      {
        path: "examples/swap-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "swap-animations-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["swap"],
    files: [
      {
        path: "examples/swap-animations-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stepper-form-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers/zod", "react-hook-form", "zod"],
    registryDependencies: ["stepper", "button", "form", "input", "textarea"],
    files: [
      {
        path: "examples/stepper-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stepper-validation-demo",
    type: "registry:example",
    dependencies: ["@hookform/resolvers", "react-hook-form", "sonner", "zod"],
    registryDependencies: ["stepper", "form"],
    files: [
      {
        path: "examples/stepper-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "stepper-vertical-demo",
    type: "registry:example",
    registryDependencies: ["stepper"],
    files: [
      {
        path: "examples/stepper-vertical-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tags-input-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    registryDependencies: ["tags-input"],
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
    registryDependencies: ["button", "tags-input"],
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
      "lucide-react",
    ],
    registryDependencies: ["button", "tags-input"],
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
    registryDependencies: ["button", "tags-input"],
    files: [
      {
        path: "examples/tags-input-validation-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/time-picker-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-step-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/time-picker-step-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-seconds-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/time-picker-seconds-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-placeholder-demo",
    type: "registry:example",
    registryDependencies: ["time-picker"],
    files: [
      {
        path: "examples/time-picker-placeholder-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-open-on-focus-demo",
    type: "registry:example",
    registryDependencies: ["time-picker"],
    files: [
      {
        path: "examples/time-picker-open-on-focus-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-input-group-click-action-demo",
    type: "registry:example",
    registryDependencies: ["time-picker"],
    files: [
      {
        path: "examples/time-picker-input-group-click-action-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-controlled-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/time-picker-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "time-picker-form-demo",
    type: "registry:example",
    registryDependencies: ["button", "form", "sonner"],
    files: [
      {
        path: "examples/time-picker-form-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/timeline-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-horizontal-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-horizontal-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-rtl-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/timeline-rtl-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-alternate-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/timeline-alternate-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-horizontal-alternate-demo",
    type: "registry:example",
    files: [
      {
        path: "examples/timeline-horizontal-alternate-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-custom-dot-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    files: [
      {
        path: "examples/timeline-custom-dot-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tour-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: ["button", "tour"],
    files: [
      {
        path: "examples/tour-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tour-controlled-demo",
    type: "registry:example",
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    registryDependencies: ["button", "tour"],
    files: [
      {
        path: "examples/tour-controlled-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
