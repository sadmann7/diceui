/**
 * The style ids we publish, shared by the registry build and the Next rewrites so
 * the two can't drift.
 *
 * shadcn composes a style id as `{base}-{preset}`. We author two bases
 * (`radix`, `base`) and all eight official presets, so `aria-*` and any legacy
 * v3 id (`new-york`, `default`) fall back to the default at the routing layer
 * rather than 404ing.
 *
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/styles.tsx
 */

const STYLE_BASES = ["radix", "base"] as const;

const STYLE_NAMES = [
  "nova",
  "vega",
  "maia",
  "lyra",
  "mira",
  "luma",
  "sera",
  "rhea",
] as const;

type StyleBase = (typeof STYLE_BASES)[number];
type StyleName = (typeof STYLE_NAMES)[number];

interface Style {
  name: StyleName;
  title: string;
  description: string;
}

const STYLES: Style[] = [
  {
    name: "nova",
    title: "Nova",
    description: "Reduced padding and margins",
  },
  {
    name: "vega",
    title: "Vega",
    description: "Clean, neutral, and familiar.",
  },
  {
    name: "maia",
    title: "Maia",
    description: "Rounded, with generous spacing.",
  },
  {
    name: "lyra",
    title: "Lyra",
    description: "Boxy and sharp. For mono fonts.",
  },
  {
    name: "mira",
    title: "Mira",
    description: "Made for compact interfaces.",
  },
  {
    name: "luma",
    title: "Luma",
    description: "Fluid, luminous, and soft.",
  },
  {
    name: "sera",
    title: "Sera",
    description: "Editorial and typographic.",
  },
  {
    name: "rhea",
    title: "Rhea",
    description: "Like Luma but compact.",
  },
];

/** Must match the default style-less `/r/{name}.json` rewrite. */
const DEFAULT_STYLE_NAME: StyleName = "nova";
const DEFAULT_STYLE_ID = "radix-nova" as const;

function getStyleIds() {
  return STYLE_BASES.flatMap((base) =>
    STYLES.map((style) => `${base}-${style.name}`),
  );
}

export {
  DEFAULT_STYLE_ID,
  DEFAULT_STYLE_NAME,
  getStyleIds,
  STYLE_BASES,
  STYLES,
  type Style,
  type StyleBase,
  type StyleName,
};
