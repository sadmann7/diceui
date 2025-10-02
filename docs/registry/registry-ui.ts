import type { Registry } from "shadcn/schema";

export const ui: Registry["items"] = [
  {
    name: "angle-slider",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot"],
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
      "class-variance-authority",
      "lucide-react",
    ],
    registryDependencies: ["button", "input", "popover", "select"],
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
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    files: [
      {
        path: "ui/color-swatch.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "cropper",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
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
    dependencies: ["@radix-ui/react-slot"],
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
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    files: [
      {
        path: "ui/file-upload.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "input-group",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    registryDependencies: ["input"],
    files: [
      {
        path: "ui/input-group.tsx",
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
    name: "kbd",
    type: "registry:ui",
    files: [
      {
        path: "ui/kbd.tsx",
        type: "registry:ui",
      },
    ],
  },
  {
    name: "listbox",
    type: "registry:ui",
    dependencies: ["@diceui/listbox", "lucide-react"],
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
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    cssVars: {
      theme: {
        "--animate-marquee-left":
          "marquee-left var(--duration) linear var(--loop-count)",
        "--animate-marquee-right":
          "marquee-right var(--duration) linear var(--loop-count)",
        "--animate-marquee-left-rtl":
          "marquee-left-rtl var(--duration) linear var(--loop-count)",
        "--animate-marquee-right-rtl":
          "marquee-right-rtl var(--duration) linear var(--loop-count)",
        "--animate-marquee-up":
          "marquee-up var(--duration) linear var(--loop-count)",
        "--animate-marquee-down":
          "marquee-down var(--duration) linear var(--loop-count)",
      },
    },
    css: {
      "@keyframes marquee-left": {
        "0%": {
          transform: "translateX(0%)",
        },
        "100%": {
          transform: "translateX(calc(-100% - var(--gap)))",
        },
      },
      "@keyframes marquee-right": {
        "0%": {
          transform: "translateX(calc(-100% - var(--gap)))",
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
          transform: "translateY(calc(-100% - var(--gap)))",
        },
      },
      "@keyframes marquee-down": {
        "0%": {
          transform: "translateY(calc(-100% - var(--gap)))",
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
          transform: "translateX(calc(100% + var(--gap)))",
        },
      },
      "@keyframes marquee-right-rtl": {
        "0%": {
          transform: "translateX(calc(100% + var(--gap)))",
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
    dependencies: ["@radix-ui/react-slot", "lucide-react", "media-chrome"],
    registryDependencies: [
      "badge",
      "button",
      "select",
      "slider",
      "tooltip",
      "dropdown-menu",
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
    dependencies: ["@diceui/mention", "lucide-react"],
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
    name: "stepper",
    type: "registry:ui",
    dependencies: [
      "@radix-ui/react-slot",
      "class-variance-authority",
      "lucide-react",
    ],
    registryDependencies: ["button"],
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
    name: "rating",
    type: "registry:ui",
    dependencies: ["@radix-ui/react-slot", "lucide-react"],
    files: [
      {
        path: "ui/rating.tsx",
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
    dependencies: ["@radix-ui/react-slot", "class-variance-authority"],
    files: [
      {
        path: "ui/stack.tsx",
        type: "registry:ui",
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
