import type { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "tags-input-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input"],
    files: [
      {
        path: "example/tags-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
