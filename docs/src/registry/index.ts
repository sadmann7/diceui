import { examples } from "@/registry/registry-examples";
import { hooks } from "@/registry/registry-hooks";
import { lib } from "@/registry/registry-lib";
import { themes } from "@/registry/registry-themes";
import { ui } from "@/registry/registry-ui";
import type { Registry } from "@/registry/schema";

export const registry: Registry = [
  ...ui,
  ...examples,
  ...lib,
  ...hooks,
  ...themes,
];
