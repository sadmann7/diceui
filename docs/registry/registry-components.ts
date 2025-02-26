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
    name: "visually-hidden",
    type: "registry:component",
    dependencies: ["@radix-ui/react-slot"],
    files: [
      {
        path: "components/visually-hidden.tsx",
        type: "registry:component",
      },
    ],
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
