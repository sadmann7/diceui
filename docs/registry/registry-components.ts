import type { Registry } from "@/registry/schema";

export const components: Registry = [
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
