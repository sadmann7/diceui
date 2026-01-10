import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "action-bar",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "button",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
    ],
    files: [
      {
        path: "ui/action-bar.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "angle-slider",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/angle-slider.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "avatar-group",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/avatar-group.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "badge-overflow",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/badge-overflow.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
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
    name: "circular-progress",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    cssVars: {
      theme: {
        "--animate-spin-around": "spin-around 0.8s linear infinite",
      },
    },
    css: {
      "@keyframes spin-around": {
        "0%": {
          transform: "rotate(-90deg)",
        },
        "100%": {
          transform: "rotate(270deg)",
        },
      },
    },
    files: [
      {
        path: "ui/circular-progress.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "color-picker",
    type: "registry:ui",
    dependencies: [
      "@radix-ui/react-slider",
      "@radix-ui/react-slot",
      "@radix-ui/react-direction",
    ],
    registryDependencies: [
      "button",
      "input",
      "popover",
      "select",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/color-picker.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "color-swatch",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/color-swatch.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "compare-slider",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/compare-slider.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "cropper",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/cropper.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
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
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/editable.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "file-upload",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: ["@diceui/use-as-ref", "@diceui/use-lazy-ref"],
    files: [
      {
        path: "ui/file-upload.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "fps",
    type: "registry:ui",
    dependencies: [],
    files: [
      {
        path: "ui/fps.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "gauge",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/gauge.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
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
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "key-value",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "button",
      "input",
      "textarea",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/key-value.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "listbox",
    type: "registry:ui",
    dependencies: ["@diceui/listbox"],
    files: [
      {
        path: "ui/listbox.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "marquee",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    cssVars: {
      theme: {
        "--animate-marquee-left":
          "marquee-left var(--marquee-duration) linear var(--marquee-loop-count)",
        "--animate-marquee-right":
          "marquee-right var(--marquee-duration) linear var(--marquee-loop-count)",
        "--animate-marquee-left-rtl":
          "marquee-left-rtl var(--marquee-duration) linear var(--marquee-loop-count)",
        "--animate-marquee-right-rtl":
          "marquee-right-rtl var(--marquee-duration) linear var(--marquee-loop-count)",
        "--animate-marquee-up":
          "marquee-up var(--marquee-duration) linear var(--marquee-loop-count)",
        "--animate-marquee-down":
          "marquee-down var(--marquee-duration) linear var(--marquee-loop-count)",
      },
    },
    css: {
      "@keyframes marquee-left": {
        "0%": {
          transform: "translateX(0%)",
        },
        "100%": {
          transform: "translateX(calc(-100% - var(--marquee-gap)))",
        },
      },
      "@keyframes marquee-right": {
        "0%": {
          transform: "translateX(calc(-100% - var(--marquee-gap)))",
        },
        "100%": {
          transform: "translateX(0%)",
        },
      },
      "@keyframes marquee-up": {
        "0%": {
          transform: "translateY(0%)",
        },
        "100%": {
          transform: "translateY(calc(-100% - var(--marquee-gap)))",
        },
      },
      "@keyframes marquee-down": {
        "0%": {
          transform: "translateY(calc(-100% - var(--marquee-gap)))",
        },
        "100%": {
          transform: "translateY(0%)",
        },
      },
      "@keyframes marquee-left-rtl": {
        "0%": {
          transform: "translateX(0%)",
        },
        "100%": {
          transform: "translateX(calc(100% + var(--marquee-gap)))",
        },
      },
      "@keyframes marquee-right-rtl": {
        "0%": {
          transform: "translateX(calc(100% + var(--marquee-gap)))",
        },
        "100%": {
          transform: "translateX(0%)",
        },
      },
    },
    files: [
      {
        path: "ui/marquee.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "mask-input",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/mask-input.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "masonry",
    type: "registry:ui",
    dependencies: ["@diceui/masonry", "@radix-ui/react-slot"],
    registryDependencies: ["@diceui/use-isomorphic-layout-effect"],
    files: [
      {
        path: "ui/masonry.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "media-player",
    type: "registry:ui",
    dependencies: [
      "@radix-ui/react-slot",
      "@radix-ui/react-direction",

      "media-chrome",
    ],
    registryDependencies: [
      "badge",
      "button",
      "select",
      "slider",
      "tooltip",
      "dropdown-menu",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/media-player.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "mention",
    type: "registry:ui",
    dependencies: ["@diceui/mention"],
    files: [
      {
        path: "ui/mention.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "relative-time-card",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: ["hover-card"],
    files: [
      {
        path: "ui/relative-time-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroller",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/scroller.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "scroll-spy",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/scroll-spy.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "segmented-input",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: ["input"],
    files: [
      {
        path: "ui/segmented-input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "selection-toolbar",
    type: "registry:ui",
    dependencies: ["@floating-ui/react-dom", "@radix-ui/react-slot"],
    registryDependencies: [
      "button",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/selection-toolbar.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
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
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "speed-dial",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "button",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/speed-dial.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "stack",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/stack.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stat",
    type: "registry:ui",
    dependencies: [],
    registryDependencies: ["separator"],
    files: [
      {
        path: "ui/stat.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "status",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "ui/status.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stepper",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "button",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/stepper.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "swap",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/swap.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "qr-code",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "qrcode"],
    devDependencies: ["@types/qrcode"],
    registryDependencies: ["@diceui/use-lazy-ref"],
    files: [
      {
        path: "ui/qr-code.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "rating",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/rating.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
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
  {
    name: "timeline",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "@radix-ui/react-direction"],
    registryDependencies: [
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/timeline.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "time-picker",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
    registryDependencies: [
      "popover",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    css: {
      "@utility scrollbar-none": {
        "scrollbar-width": "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
    files: [
      {
        path: "ui/time-picker.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
  {
    name: "tour",
    type: "registry:ui",
    dependencies: [
      "@floating-ui/react-dom",
      "@radix-ui/react-slot",
      "@radix-ui/react-direction",
    ],
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    files: [
      {
        path: "ui/tour.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
  },
];
