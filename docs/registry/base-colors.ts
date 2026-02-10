import { THEMES } from "@/registry/themes";

/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/base-colors.ts
 */

export const BASE_COLORS = THEMES.filter((theme) =>
  ["neutral", "stone", "zinc", "gray"].includes(theme.name),
);

export type BaseColor = (typeof BASE_COLORS)[number];
