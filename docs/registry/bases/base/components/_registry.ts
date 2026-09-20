import type { Registry } from "shadcn/schema";

export const components: Registry["items"] = [
  {
    name: "client-only",
    type: "registry:component",
    files: [
      {
        path: "components/client-only.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "direction-provider",
    type: "registry:component",
    files: [
      {
        path: "components/direction-provider.tsx",
        type: "registry:component",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "portal",
    type: "registry:component",
    files: [
      {
        path: "components/portal.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "presence",
    type: "registry:component",
    files: [
      {
        path: "components/presence.tsx",
        type: "registry:component",
      },
    ],
    dependencies: ["@base-ui/react"],
  },
  {
    name: "presentation-zoom-select",
    type: "registry:component",
    files: [
      {
        path: "components/presentation-zoom-select.tsx",
        type: "registry:component",
      },
    ],
    registryDependencies: ["select"],
    dependencies: ["@diceui/pptx"],
  },
  {
    name: "visually-hidden-input",
    type: "registry:component",
    files: [
      {
        path: "components/visually-hidden-input.tsx",
        type: "registry:component",
      },
    ],
  },
];
