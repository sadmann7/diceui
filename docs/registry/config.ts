/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/config.ts
 */

import { z } from "zod";

import { BASE_COLORS, type BaseColor } from "@/registry/base-colors";
import { BASES, type Base } from "@/registry/bases";
import { fonts } from "@/registry/fonts";
import { STYLES, type Style } from "@/registry/styles";
import { THEMES, type Theme } from "@/registry/themes";

export { BASES, type Base };
export { STYLES, type Style };
export { THEMES, type Theme };
export { BASE_COLORS, type BaseColor };
export { fonts };

export type BaseName = Base["name"];
export type StyleName = Style["name"];
export type ThemeName = Theme["name"];
export type BaseColorName = BaseColor["name"];

// Derive font values from registry fonts (e.g., "font-inter" -> "inter").
const fontValues = fonts.map((f) => f.name.replace("font-", "")) as [
  string,
  ...string[],
];

export type FontValue = (typeof fontValues)[number];

export const RADII = [
  { name: "default", label: "Default", value: "" },
  { name: "none", label: "None", value: "0" },
  { name: "small", label: "Small", value: "0.45rem" },
  { name: "medium", label: "Medium", value: "0.625rem" },
  { name: "large", label: "Large", value: "0.875rem" },
] as const;

export type Radius = (typeof RADII)[number];
export type RadiusValue = Radius["name"];

const baseNames = BASES.map((b) => b.name) as [BaseName, ...BaseName[]];
const styleNames = STYLES.map((s) => s.name) as [StyleName, ...StyleName[]];
const baseColorNames = BASE_COLORS.map((c) => c.name) as [
  BaseColorName,
  ...BaseColorName[],
];
const themeNames = THEMES.map((t) => t.name) as [ThemeName, ...ThemeName[]];
const radiusNames = RADII.map((r) => r.name) as [RadiusValue, ...RadiusValue[]];

export const designSystemConfigSchema = z
  .object({
    base: z.enum(baseNames),
    style: z.enum(styleNames),
    baseColor: z.enum(baseColorNames).default("neutral"),
    theme: z.enum(themeNames),
    font: z.enum(fontValues).default("inter"),
    radius: z.enum(radiusNames).default("default"),
  })
  .refine(
    (data) => {
      const availableThemes = getThemesForBaseColor(data.baseColor);
      return availableThemes.some((t) => t.name === data.theme);
    },
    {
      message: "Theme is not available for the selected base color",
      path: ["theme"],
    },
  );

export type DesignSystemConfig = z.infer<typeof designSystemConfigSchema>;

export const DEFAULT_CONFIG: DesignSystemConfig = {
  base: "radix",
  style: "default",
  baseColor: "neutral",
  theme: "neutral",
  font: "inter",
  radius: "default",
};

export function getThemesForBaseColor(baseColorName: string) {
  const baseColorNames = BASE_COLORS.map((bc) => bc.name);

  return THEMES.filter((theme) => {
    if (theme.name === baseColorName) {
      return true;
    }
    return !baseColorNames.includes(theme.name);
  });
}

export function getBase(name: BaseName) {
  return BASES.find((base) => base.name === name);
}

export function getStyle(name: StyleName) {
  return STYLES.find((style) => style.name === name);
}

export function getTheme(name: ThemeName) {
  return THEMES.find((theme) => theme.name === name);
}

export function getBaseColor(name: BaseColorName) {
  return BASE_COLORS.find((color) => color.name === name);
}

// Builds a registry:theme item from a design system config.
export function buildRegistryTheme(config: DesignSystemConfig) {
  const baseColor = getBaseColor(config.baseColor);
  const theme = getTheme(config.theme);

  if (!baseColor || !theme) {
    throw new Error(
      `Base color "${config.baseColor}" or theme "${config.theme}" not found`,
    );
  }

  // Merge base color and theme CSS vars.
  const lightVars: Record<string, string> = {
    ...(baseColor.cssVars?.light as Record<string, string>),
    ...(theme.cssVars?.light as Record<string, string>),
  };
  const darkVars: Record<string, string> = {
    ...(baseColor.cssVars?.dark as Record<string, string>),
    ...(theme.cssVars?.dark as Record<string, string>),
  };

  // Apply radius transformation.
  if (config.radius && config.radius !== "default") {
    const radius = RADII.find((r) => r.name === config.radius);
    if (radius?.value) {
      lightVars.radius = radius.value;
    }
  }

  return {
    name: `${config.baseColor}-${config.theme}`,
    type: "registry:theme" as const,
    cssVars: {
      light: lightVars,
      dark: darkVars,
    },
  };
}

// Builds a registry:base item from a design system config.
export function buildRegistryBase(config: DesignSystemConfig) {
  const baseItem = getBase(config.base);

  if (!baseItem) {
    throw new Error(`Base "${config.base}" not found`);
  }

  const registryTheme = buildRegistryTheme(config);

  // Build dependencies.
  const dependencies = [
    "class-variance-authority",
    "tailwindcss-animate",
    ...(baseItem.dependencies ?? []),
  ];

  const registryDependencies = ["utils"];

  if (config.font) {
    registryDependencies.push(`font-${config.font}`);
  }

  return {
    name: `${config.base}-${config.style}`,
    extends: "none",
    type: "registry:base" as const,
    config: {
      style: `${config.base}-${config.style}`,
      tailwind: {
        baseColor: config.baseColor,
      },
    },
    dependencies,
    registryDependencies,
    cssVars: registryTheme.cssVars,
    css: {
      '@import "tailwindcss-animate"': {},
      "@layer base": {
        "*": { "@apply border-border outline-ring/50": {} },
        body: { "@apply bg-background text-foreground": {} },
      },
    },
  };
}
