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
    name: "editable-demo",
    type: "registry:example",
    registryDependencies: ["editable"],
    files: [
      {
        path: "examples/editable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-double-click-demo",
    type: "registry:example",
    registryDependencies: ["editable"],
    files: [
      {
        path: "examples/editable-double-click-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-autosize-demo",
    type: "registry:example",
    registryDependencies: ["editable"],
    files: [
      {
        path: "examples/editable-autosize-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-todo-list-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["editable", "checkbox"],
    files: [
      {
        path: "examples/editable-todo-list-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "editable-form-demo",
    type: "registry:example",
    dependencies: ["react-hook-form", "@hookform/resolvers", "zod", "sonner"],
    registryDependencies: ["editable", "form"],
    files: [
      {
        path: "examples/editable-form-demo.tsx",
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
    name: "relative-time-card-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "relative-time-card"],
    files: [
      {
        path: "examples/relative-time-card-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-basic-demo",
    type: "registry:example",
    registryDependencies: ["relative-time-card"],
    files: [
      {
        path: "examples/relative-time-card-basic-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-variants-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["button", "relative-time-card"],
    files: [
      {
        path: "examples/relative-time-card-variants-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "relative-time-card-timezones-demo",
    type: "registry:example",
    registryDependencies: ["relative-time-card"],
    files: [
      {
        path: "examples/relative-time-card-timezones-demo.tsx",
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
    name: "timeline-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-alternate-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-alternate-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-custom-dot-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-custom-dot-demo.tsx",
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
    name: "timeline-horizontal-alternate-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-horizontal-alternate-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "timeline-rtl-demo",
    type: "registry:example",
    registryDependencies: ["timeline"],
    files: [
      {
        path: "examples/timeline-rtl-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
