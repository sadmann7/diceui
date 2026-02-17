import type { Registry } from "shadcn/schema";

export const examples: Registry["items"] = [
  {
    name: "action-bar-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["action-bar", "checkbox"],
    files: [
      {
        path: "examples/action-bar-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "action-bar-position-demo",
    type: "registry:example",
    dependencies: ["lucide-react"],
    registryDependencies: ["action-bar", "label", "select", "switch"],
    files: [
      {
        path: "examples/action-bar-position-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
