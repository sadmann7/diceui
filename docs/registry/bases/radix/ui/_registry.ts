import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "action-bar",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: ["button", "@diceui/use-value-as-ref"],
    files: [
      {
        path: "ui/action-bar.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "angle-slider",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    ],
  },
  {
    name: "avatar-group",
    type: "registry:ui",
    dependencies: ["radix-ui"],
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
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/badge-overflow.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "banner",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "button",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/banner.tsx",
        type: "registry:ui",
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
    dependencies: ["radix-ui"],
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
    dependencies: ["radix-ui"],
    registryDependencies: [
      "button",
      "input",
      "popover",
      "select",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    ],
  },
  {
    name: "color-swatch",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/color-swatch.tsx",
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
    dependencies: ["cmdk", "radix-ui"],
  },
  {
    name: "compare-slider",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/compare-slider.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cropper",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/cropper.tsx",
        type: "registry:ui",
      },
    ],
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
    name: "editable",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    ],
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
    dependencies: ["cmdk", "radix-ui"],
  },
  {
    name: "file-upload",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
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
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/gauge.tsx",
        type: "registry:ui",
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
      "radix-ui",
    ],
    files: [
      {
        path: "ui/kanban.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "key-value",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "button",
      "input",
      "textarea",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    dependencies: ["radix-ui"],
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
    ],
  },
  {
    name: "mask-input",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/mask-input.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "masonry",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/masonry.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "media-player",
    type: "registry:ui",
    dependencies: ["radix-ui", "media-chrome"],
    registryDependencies: [
      "badge",
      "button",
      "select",
      "slider",
      "tooltip",
      "dropdown-menu",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/media-player.tsx",
        type: "registry:ui",
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
    name: "phone-input",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "command",
      "input",
      "popover",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
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
  },
  {
    name: "presentation",
    type: "registry:ui",
    dependencies: ["@diceui/pptx"],
    registryDependencies: ["button", "@diceui/use-mobile"],
    files: [
      {
        path: "ui/presentation.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "relative-time-card",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: ["hover-card"],
    files: [
      {
        path: "ui/relative-time-card.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "responsive-dialog",
    type: "registry:ui",
    dependencies: ["radix-ui", "vaul"],
    registryDependencies: [
      "dialog",
      "drawer",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
      "@diceui/use-mobile",
    ],
    files: [
      {
        path: "ui/responsive-dialog.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroller",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "ui/scroller.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "scroll-spy",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/scroll-spy.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "segmented-input",
    type: "registry:ui",
    dependencies: ["radix-ui"],
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
    dependencies: ["@floating-ui/react-dom", "radix-ui"],
    registryDependencies: [
      "button",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/selection-toolbar.tsx",
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
      "radix-ui",
    ],
    files: [
      {
        path: "ui/sortable.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "speed-dial",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "button",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/speed-dial.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "stack",
    type: "registry:ui",
    dependencies: ["radix-ui"],
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
    dependencies: ["radix-ui"],
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
    dependencies: ["radix-ui"],
    registryDependencies: [
      "button",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/stepper.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "swap",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    dependencies: ["radix-ui", "qrcode"],
    devDependencies: ["@types/qrcode"],
    registryDependencies: ["@diceui/use-ref-with-init"],
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
    dependencies: ["radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    dependencies: ["radix-ui"],
    registryDependencies: ["@diceui/use-ref-with-init"],
    files: [
      {
        path: "ui/timeline.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "time-picker",
    type: "registry:ui",
    dependencies: ["radix-ui"],
    registryDependencies: [
      "popover",
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
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
    ],
  },
  {
    name: "tour",
    type: "registry:ui",
    dependencies: ["@floating-ui/react-dom", "radix-ui"],
    registryDependencies: [
      "@diceui/use-value-as-ref",
      "@diceui/use-ref-with-init",
    ],
    files: [
      {
        path: "ui/tour.tsx",
        type: "registry:ui",
      },
    ],
  },
];
