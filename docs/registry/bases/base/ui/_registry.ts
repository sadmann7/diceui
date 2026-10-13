import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "action-bar",
    type: "registry:ui",
    files: [
      {
        path: "ui/action-bar.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button", "direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "angle-slider",
    type: "registry:ui",
    files: [
      {
        path: "ui/angle-slider.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "avatar-group",
    type: "registry:ui",
    files: [
      {
        path: "ui/avatar-group.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "badge-overflow",
    type: "registry:ui",
    files: [
      {
        path: "ui/badge-overflow.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "banner",
    type: "registry:ui",
    files: [
      {
        path: "ui/banner.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
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
    files: [
      {
        path: "ui/circular-progress.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react"],
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
  },
  {
    name: "color-picker",
    type: "registry:ui",
    files: [
      {
        path: "ui/color-picker.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["button", "input", "popover", "select", "direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "color-swatch",
    type: "registry:ui",
    files: [
      {
        path: "ui/color-swatch.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "combobox",
    type: "registry:ui",
    dependencies: ["@diceui/combobox"],
    files: [
      {
        path: "ui/combobox.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "command-stack",
    type: "registry:ui",
    files: [
      {
        path: "ui/command-stack.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["command"],
    dependencies: ["@base-ui/react", "@base-ui/utils", "cmdk"],
  },
  {
    name: "compare-slider",
    type: "registry:ui",
    files: [
      {
        path: "ui/compare-slider.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "cropper",
    type: "registry:ui",
    files: [
      {
        path: "ui/cropper.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "editable",
    type: "registry:ui",
    files: [
      {
        path: "ui/editable.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "faceted",
    type: "registry:ui",
    files: [
      {
        path: "ui/faceted.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["command", "popover"],
    dependencies: ["@base-ui/react", "@base-ui/utils", "cmdk"],
  },
  {
    name: "file-upload",
    type: "registry:ui",
    files: [
      {
        path: "ui/file-upload.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "fps",
    type: "registry:ui",
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
    files: [
      {
        path: "ui/gauge.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "kanban",
    type: "registry:ui",
    files: [
      {
        path: "ui/kanban.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: [
      "@base-ui/react",
      "@base-ui/utils",
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },
  {
    name: "key-value",
    type: "registry:ui",
    files: [
      {
        path: "ui/key-value.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["button", "input", "textarea"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
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
    files: [
      {
        path: "ui/marquee.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
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
          transform: "translateY(calc(-100% - var(--marquee-gap)))",
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
  },
  {
    name: "mask-input",
    type: "registry:ui",
    files: [
      {
        path: "ui/mask-input.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "masonry",
    type: "registry:ui",
    files: [
      {
        path: "ui/masonry.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "media-player",
    type: "registry:ui",
    files: [
      {
        path: "ui/media-player.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: [
      "badge",
      "button",
      "dropdown-menu",
      "tooltip",
      "direction",
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils", "media-chrome"],
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
    name: "phone-input",
    type: "registry:ui",
    files: [
      {
        path: "ui/phone-input.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["popover", "command", "input"],
    dependencies: ["@base-ui/react", "@base-ui/utils", "cmdk"],
  },
  {
    name: "presentation",
    type: "registry:ui",
    files: [
      {
        path: "ui/presentation.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button", "@diceui/use-mobile"],
    dependencies: ["@diceui/pptx"],
  },
  {
    name: "qr-code",
    type: "registry:ui",
    files: [
      {
        path: "ui/qr-code.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils", "qrcode"],
    devDependencies: ["@types/qrcode"],
  },
  {
    name: "rating",
    type: "registry:ui",
    files: [
      {
        path: "ui/rating.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "relative-time-card",
    type: "registry:ui",
    files: [
      {
        path: "ui/relative-time-card.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["hover-card"],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "responsive-dialog",
    type: "registry:ui",
    files: [
      {
        path: "ui/responsive-dialog.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["dialog", "drawer", "@diceui/use-mobile"],
    dependencies: ["@base-ui/utils"],
  },
  {
    name: "scroll-spy",
    type: "registry:ui",
    files: [
      {
        path: "ui/scroll-spy.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "scroller",
    type: "registry:ui",
    files: [
      {
        path: "ui/scroller.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "segmented-input",
    type: "registry:ui",
    files: [
      {
        path: "ui/segmented-input.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["input", "direction"],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "selection-toolbar",
    type: "registry:ui",
    files: [
      {
        path: "ui/selection-toolbar.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button"],
    dependencies: [
      "@base-ui/react",
      "@base-ui/utils",
      "@floating-ui/react-dom",
    ],
  },
  {
    name: "sortable",
    type: "registry:ui",
    files: [
      {
        path: "ui/sortable.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: [
      "@base-ui/react",
      "@base-ui/utils",
      "@dnd-kit/core",
      "@dnd-kit/modifiers",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
    ],
  },
  {
    name: "speed-dial",
    type: "registry:ui",
    files: [
      {
        path: "ui/speed-dial.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "stack",
    type: "registry:ui",
    files: [
      {
        path: "ui/stack.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "stat",
    type: "registry:ui",
    files: [
      {
        path: "ui/stat.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["separator"],
  },
  {
    name: "status",
    type: "registry:ui",
    files: [
      {
        path: "ui/status.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "stepper",
    type: "registry:ui",
    files: [
      {
        path: "ui/stepper.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "swap",
    type: "registry:ui",
    files: [
      {
        path: "ui/swap.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
  },
  {
    name: "timeline",
    type: "registry:ui",
    files: [
      {
        path: "ui/timeline.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
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
    name: "time-picker",
    type: "registry:ui",
    files: [
      {
        path: "ui/time-picker.tsx",
        type: "registry:ui",
      },
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["popover"],
    dependencies: ["@base-ui/react", "@base-ui/utils"],
    css: {
      "@utility scrollbar-none": {
        "scrollbar-width": "none",
        "&::-webkit-scrollbar": {
          display: "none",
        },
      },
    },
  },
  {
    name: "tour",
    type: "registry:ui",
    files: [
      {
        path: "ui/tour.tsx",
        type: "registry:ui",
      },
    ],
    registryDependencies: ["button", "direction"],
    dependencies: [
      "@base-ui/react",
      "@base-ui/utils",
      "@floating-ui/react-dom",
    ],
  },
];
