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
  },
  {
    name: "hitbox",
    type: "registry:component",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "components/hitbox.tsx",
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
    name: "pending",
    type: "registry:component",
    dependencies: ["radix-ui"],
    files: [
      {
        path: "components/pending.tsx",
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
  },
  {
    name: "visually-hidden",
    type: "registry:component",
    dependencies: ["radix-ui"],
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
