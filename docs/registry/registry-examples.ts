import type { Registry } from "@/registry/schema";

export const examples: Registry = [
  {
    name: "tags-input-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    files: [
      {
        path: "example/tags-input-demo.tsx",
        type: "registry:example",
      },
    ],
  },
  {
    name: "tags-input-editable-demo",
    type: "registry:example",
    dependencies: ["@diceui/tags-input", "lucide-react"],
    files: [
      {
        path: "example/tags-input-editable-demo.tsx",
        type: "registry:example",
      },
    ],
  },
];
