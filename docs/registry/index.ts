import { components } from "@/registry/registry-components";
import { examples } from "@/registry/registry-examples";
import { lib } from "@/registry/registry-lib";
import { themes } from "@/registry/registry-themes";
import { ui } from "@/registry/registry-ui";
import type { Registry } from "shadcn/registry";

export const registry: Registry["items"] = [
  ...ui,
  ...lib,
  ...themes,
  ...examples,
  ...components,
];
