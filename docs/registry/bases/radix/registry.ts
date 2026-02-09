import type { Registry } from "shadcn/schema";

import { blocks } from "./blocks/_registry";
import { components } from "./components/_registry";
import { examples } from "./examples/_registry";
import { hooks } from "./hooks/_registry";
import { internal } from "./internal/_registry";
import { lib } from "./lib/_registry";
import { ui } from "./ui/_registry";

export const registry: Registry = {
  name: "diceui/radix",
  homepage: "https://diceui.com",
  items: [
    ...ui,
    ...examples,
    ...lib,
    ...components,
    ...blocks,
    ...hooks,
    ...internal,
  ],
};
