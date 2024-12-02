import { examples } from "@/registry/registry-examples";
import { lib } from "@/registry/registry-lib";
import { themes } from "@/registry/registry-themes";
import { ui } from "@/registry/registry-ui";
import type { Registry } from "@/registry/schema";

export const registry: Registry = [...ui, ...examples, ...lib, ...themes];
