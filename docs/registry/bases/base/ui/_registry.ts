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
    registryDependencies: [
      "button",
      "direction",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
    ],
    dependencies: ["@base-ui/react"],
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
    name: "scroller",
    type: "registry:ui",
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
    dependencies: ["@base-ui/react", "lucide-react"],
  },
  {
    name: "badge-overflow",
    type: "registry:ui",
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
    dependencies: ["@base-ui/react"],
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
    name: "gauge",
    type: "registry:ui",
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
    dependencies: ["@base-ui/react"],
  },
  {
    name: "hover-card",
    type: "registry:ui",
    files: [
      {
        path: "ui/hover-card.tsx",
        type: "registry:ui",
      },
    ],
    dependencies: ["radix-ui"],
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
    registryDependencies: [
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "qr-code",
    type: "registry:ui",
    files: [
      {
        path: "ui/qr-code.tsx",
        type: "registry:ui",
      },
      {
        path: "lib/compose-refs.ts",
        type: "registry:lib",
      },
    ],
    registryDependencies: ["@diceui/use-lazy-ref"],
    dependencies: ["@base-ui/react", "qrcode"],
    devDependencies: ["@types/qrcode"],
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
    name: "rating",
    type: "registry:ui",
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
    registryDependencies: [
      "direction",
      "visually-hidden-input",
      "@diceui/use-as-ref",
      "@diceui/use-isomorphic-layout-effect",
      "@diceui/use-lazy-ref",
    ],
    dependencies: ["@base-ui/react", "lucide-react"],
  },
  {
    name: "marquee",
    type: "registry:ui",
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
    registryDependencies: ["direction"],
    dependencies: ["@base-ui/react"],
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
  },
];
