import type { Registry } from "shadcn/schema";

export const hooks: Registry["items"] = [
  {
    name: "use-as-ref",
    type: "registry:hook",
    registryDependencies: ["@diceui/use-isomorphic-layout-effect"],
    files: [
      {
        path: "hooks/use-as-ref.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-isomorphic-layout-effect",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-isomorphic-layout-effect.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-lazy-ref",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-lazy-ref.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-mobile",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-mobile.ts",
        type: "registry:hook",
      },
    ],
  },
];
