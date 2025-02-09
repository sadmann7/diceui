import type { Registry } from "@/registry/schema";

export const components: Registry = [
  {
    name: "direction-provider",
    type: "registry:component",
    files: [
      {
        path: "components/direction-provider.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "hydration-boundary",
    type: "registry:component",
    files: [
      {
        path: "components/hydration-boundary.tsx",
        type: "registry:component",
      },
    ],
  },
  {
    name: "visually-hidden",
    type: "registry:component",
    files: [
      {
        path: "components/visually-hidden.tsx",
        type: "registry:component",
      },
    ],
  },
];
