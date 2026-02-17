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
    name: "direction",
    type: "registry:ui",
    files: [
      {
        path: "ui/direction.tsx",
        type: "registry:ui",
      },
    ],
  },
];
