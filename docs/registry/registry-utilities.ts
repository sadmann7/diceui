import type { Registry } from "@/registry/schema";

export const utilities: Registry = [
  {
    name: "direction-provider",
    type: "registry:utility",
    files: [
      {
        path: "utility/direction-provider.tsx",
        type: "registry:utility",
      },
    ],
  },
  {
    name: "hydration-boundary",
    type: "registry:utility",
    files: [
      {
        path: "utility/hydration-boundary.tsx",
        type: "registry:utility",
      },
    ],
  },
  {
    name: "visually-hidden",
    type: "registry:utility",
    files: [
      {
        path: "utility/visually-hidden.tsx",
        type: "registry:utility",
      },
    ],
  },
];
