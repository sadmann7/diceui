import { execFileSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

import { STYLES } from "../registry/styles";

const SHADCN_REF = "c2477f311c19982ef6e246085438e6cfec3e35ea";
const SHADCN_RAW = `https://raw.githubusercontent.com/shadcn-ui/ui/${SHADCN_REF}/apps/v4/registry`;
const BASES = ["base", "radix"] as const;

const BASES_PATH = path.join(process.cwd(), "registry", "bases");
const SHADCN_STYLES_PATH = path.join(
  process.cwd(),
  "registry",
  "styles",
  "shadcn",
);

type Patch = [search: string, replace: string];

const PATCHES: Record<string, Patch[]> = {
  "base/ui/dropdown-menu.tsx": [
    [
      `  sideOffset = 4,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>`,
      `  sideOffset = 4,
  className,
  container,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    container?: MenuPrimitive.Portal.Props["container"]
  }) {
  return (
    <MenuPrimitive.Portal container={container}>`,
    ],
    [
      `    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn("cn-dropdown-menu-label", className)}
      {...props}
    />`,
      `    <MenuPrimitive.Group data-slot="dropdown-menu-label-group">
      <MenuPrimitive.GroupLabel
        data-slot="dropdown-menu-label"
        data-inset={inset}
        className={cn("cn-dropdown-menu-label", className)}
        {...props}
      />
    </MenuPrimitive.Group>`,
    ],
  ],
  "radix/ui/dropdown-menu.tsx": [
    [
      `  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>`,
      `  sideOffset = 4,
  container,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Content> & {
  container?: DropdownMenuPrimitive.DropdownMenuPortalProps["container"]
}) {
  return (
    <DropdownMenuPrimitive.Portal container={container}>`,
    ],
  ],
  "base/ui/tooltip.tsx": [
    [
      `  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>`,
      `  alignOffset = 0,
  container,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > & {
    container?: TooltipPrimitive.Portal.Props["container"]
  }) {
  return (
    <TooltipPrimitive.Portal container={container}>`,
    ],
  ],
  "radix/ui/tooltip.tsx": [
    [
      `  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>`,
      `  sideOffset = 0,
  container,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  container?: TooltipPrimitive.TooltipPortalProps["container"]
}) {
  return (
    <TooltipPrimitive.Portal container={container}>`,
    ],
  ],
  "base/ui/calendar.tsx": [
    [
      `    <Button
      variant="ghost"
      size="icon"
      data-day=`,
      `    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day=`,
    ],
  ],
};

async function fetchText(url: string) {
  const response = await fetch(url);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function getShadcnComponents(base: string) {
  const registry = await fs.readFile(
    path.join(BASES_PATH, base, "ui", "_registry.ts"),
    "utf8",
  );
  const ours = new Set(
    [...registry.matchAll(/ui\/([a-z0-9-]+)\.tsx/g)].map((m) => m[1]),
  );
  const files = await fs.readdir(path.join(BASES_PATH, base, "ui"));
  return files
    .filter((file) => file.endsWith(".tsx"))
    .map((file) => file.slice(0, -4))
    .filter((name) => !ours.has(name));
}

async function syncComponents() {
  const written: string[] = [];

  for (const base of BASES) {
    for (const name of await getShadcnComponents(base)) {
      const file = `${base}/ui/${name}.tsx`;
      let source = await fetchText(`${SHADCN_RAW}/bases/${file}`);
      if (source === null) continue;

      source = source.replaceAll(
        "@/app/(create)/components/icon-placeholder",
        "@/registry/icons/icon-placeholder",
      );
      for (const [search, replace] of PATCHES[file] ?? []) {
        if (!source.includes(search)) {
          throw new Error(`Patch for ${file} no longer applies upstream`);
        }
        source = source.replace(search, replace);
      }

      const target = path.join(BASES_PATH, file);
      await fs.writeFile(target, source);
      written.push(target);
    }
  }

  return written;
}

async function syncStyles(components: string[]) {
  const sources = await Promise.all(
    components.map((file) => fs.readFile(file, "utf8")),
  );
  const markers = new Set(
    sources.flatMap((source) => source.match(/\bcn-[\w-]+/g) ?? []),
  );

  await fs.mkdir(SHADCN_STYLES_PATH, { recursive: true });
  for (const style of STYLES) {
    const css = await fetchText(`${SHADCN_RAW}/styles/style-${style.name}.css`);
    if (css === null) throw new Error(`Missing shadcn style-${style.name}.css`);

    const rules = [
      ...css.matchAll(/^ {2}\.(cn-[\w-]+) \{\n {4}@apply ([^;]+);\n {2}\}$/gm),
    ]
      .filter((m) => markers.has(m[1]!))
      .map((m) => `  .${m[1]} {\n    @apply ${m[2]};\n  }`);

    await fs.writeFile(
      path.join(SHADCN_STYLES_PATH, `style-${style.name}.css`),
      `.style-${style.name} {\n${rules.join("\n\n")}\n}\n`,
    );
  }
}

const components = await syncComponents();
await syncStyles(components);
execFileSync("oxfmt", ["--write", ...components, SHADCN_STYLES_PATH], {
  stdio: "inherit",
});
console.log(
  `Synced ${components.length} components from shadcn-ui/ui@${SHADCN_REF.slice(0, 7)}`,
);
