import type { Registry } from "shadcn/schema";
import { blocks } from "@/registry/registry-blocks";
import { components } from "@/registry/registry-components";
import { examples } from "@/registry/registry-examples";
import { hooks } from "@/registry/registry-hooks";
import { internal } from "@/registry/registry-internal";
import { lib } from "@/registry/registry-lib";
import { ui } from "@/registry/registry-ui";

export const registry = {
  name: "diceui/ui",
  homepage: "https://diceui.com",
  items: [
    {
      name: "index",
      type: "registry:style",
      dependencies: [
        "tailwindcss-animate",
        "class-variance-authority",
        "lucide-react",
      ],
      registryDependencies: ["utils"],
      tailwind: {
        config: {
          plugins: ['require("tailwindcss-animate")'],
        },
      },
      cssVars: {},
      files: [],
    },
    {
      name: "style",
      type: "registry:style",
      dependencies: [
        "tailwindcss-animate",
        "class-variance-authority",
        "lucide-react",
      ],
      registryDependencies: ["utils"],
      tailwind: {
        config: {
          plugins: ['require("tailwindcss-animate")'],
        },
      },
      cssVars: {},
      files: [],
    },
    ...ui,
    ...blocks,
    ...lib,
    ...hooks,
    ...examples,
    ...components,

    // Internal use only.
    ...internal,
  ],
} satisfies Registry;
