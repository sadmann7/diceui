import type { Registry } from "shadcn/schema";

export const hooks: Registry["items"] = [
  {
    name: "use-as-ref",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-as-ref.ts",
        type: "registry:hook",
      },
    ],
    dependencies: ["radix-ui"],
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
  {
    name: "use-ref-with-init",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-ref-with-init.ts",
        type: "registry:hook",
      },
    ],
  },
  {
    name: "use-value-as-ref",
    type: "registry:hook",
    files: [
      {
        path: "hooks/use-value-as-ref.ts",
        type: "registry:hook",
      },
    ],
    dependencies: ["radix-ui"],
  },
];
