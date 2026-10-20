import { promises as fs } from "node:fs";
import path from "node:path";
import { twMerge } from "tailwind-merge";

import { STYLES } from "../registry/styles";
import { writeFileIfChanged } from "./write-files.mts";

// Generates every style from `style-new-york.css` using how shadcn's own parts
// change per style (`shadcn/roles.json`, from `pnpm shadcn:sync`).

const STYLES_SRC_PATH = path.join(process.cwd(), "registry", "styles");
const SOURCE_STYLE = "new-york";
const SIDE_RADIUS = /^rounded-(tl|tr|br|bl|ss|se|es|ee|t|r|b|l|s|e)(?=-|$)/;
const RULE = /^ {2}\.(cn-[\w-]+) \{\n {4}@apply ([^;]+);\n {2}\}$/gm;

type Roles = Record<string, Record<string, string>>;

export function getRules(css: string) {
  return new Map([...css.matchAll(RULE)].map((m) => [m[1]!, m[2]!]));
}

const split = (classes: string) => classes.split(/\s+/).filter(Boolean);
const unimportant = (token: string) => token.replace(/!$/, "");

function getUtility(token: string) {
  let depth = 0;
  let end = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token[i];
    if (char === "[" || char === "(") depth++;
    else if (char === "]" || char === ")") depth--;
    else if (char === ":" && depth === 0) end = i + 1;
  }
  return {
    variants: token.slice(0, end),
    utility: unimportant(token.slice(end)),
  };
}

function getFamily(token: string) {
  const match = getUtility(token)
    .utility.replace(/^-/, "")
    .match(
      /^(rounded|min-h|h|p[xytrblse]?|gap|text|font|tracking|leading|shadow|ring|bg|border|size)(?=-|$)/,
    );
  if (
    !match ||
    /^border-(solid|dashed|dotted|none)$/.test(getUtility(token).utility)
  ) {
    return null;
  }
  return /^p[xytrblse]?$/.test(match[1]!) ? "p" : match[1]!;
}

// `strict` requires the same property, so `p-4` isn't a counterpart of `py-4`.
function findCounterpart(token: string, classes: string[], strict = false) {
  return (
    classes.find((other) => unimportant(other) === token) ??
    classes.find((other) => {
      const value = unimportant(other);
      return (
        value !== token &&
        twMerge(`${token} ${value}`) === value &&
        (!strict || twMerge(`${value} ${token}`) === token)
      );
    })
  );
}

// A value built on another component's CSS variable, like Card's
// `py-(--card-spacing)`, which means nothing outside that component.
const usesVariable = (token: string) => /\(--|var\(--/.test(token);

// Colors mean something specific to each part (a hover highlight, a
// destructive state), so only a matched shadcn part may change them.
function isColor(token: string) {
  const utility = getUtility(token).utility.replace(/^-/, "");
  if (
    /^(bg|fill|stroke|from|via|to|accent|caret|decoration|placeholder)-/.test(
      utility,
    )
  ) {
    return true;
  }
  if (utility.startsWith("text-")) {
    return !/^text-(xs|sm|base|lg|xl|\d+xl|\[\d)/.test(utility);
  }
  if (/^border(-[xytrblse])?-/.test(utility)) {
    return !/^border(-[xytrblse])?-(\d+|\[\d)/.test(utility);
  }
  if (/^(ring|outline)-/.test(utility)) {
    return !/^(ring|outline)-(\d+|inset|offset|\[\d)/.test(utility);
  }
  return false;
}

function isAddedBorder(other: string, newYork: string[]) {
  const value = unimportant(other);
  return (
    getFamily(other) === "border" &&
    !usesVariable(other) &&
    !newYork.some(
      (token) =>
        token === value ||
        (twMerge(`${token} ${value}`) === value &&
          twMerge(`${value} ${token}`) === token),
    )
  );
}

const getKind = (marker: string) =>
  marker
    .replace(/(-\d+|-radix)+$/, "")
    .split("-")
    .pop();

function toSpacingScale(token: string) {
  return token.replace(
    /^(.*?)(-?(?:p[xytrblse]?|m[xytrblse]?|gap(?:-[xy])?|size|[hw]|min-[hw]|max-[hw]|inset(?:-[xy])?|top|right|bottom|left|start|end)-)\[(\d+)px\](!?)$/,
    (
      match,
      variants: string,
      utility: string,
      px: string,
      important: string,
    ) =>
      Number(px) % 2 === 0
        ? `${variants}${utility}${Number(px) / 4}${important}`
        : match,
  );
}

// `/* @role cn-dropdown-menu-content */` above a rule in the source pins the
// shadcn part it copies, for rules the generator can't match on its own.
export function getRoleHints(css: string) {
  return new Map(
    [...css.matchAll(/\/\* @role (cn-[\w-]+) \*\/\n {2}\.(cn-[\w-]+) \{/g)].map(
      (m) => [m[2]!, m[1]!],
    ),
  );
}

export function createStyleGenerator(roles: Roles) {
  const styleNames = STYLES.map((style) => style.name);

  const sensitive = new Map<string, Set<string>>();
  const allSensitive = new Set<string>();
  for (const [marker, classesByStyle] of Object.entries(roles)) {
    const changed = split(classesByStyle[SOURCE_STYLE] ?? "").filter(
      (token) =>
        getFamily(token) &&
        styleNames.some((style) => {
          const target = split(classesByStyle[style] ?? "");
          const counterpart = findCounterpart(token, target);
          return !counterpart || unimportant(counterpart) !== token;
        }),
    );
    if (!changed.length) continue;
    sensitive.set(marker, new Set(changed));
    for (const token of changed) allSensitive.add(token);
  }

  const fallback = Object.fromEntries(
    styleNames.map((style) => {
      const votes = new Map<string, Map<string, number>>();
      for (const [marker, tokens] of sensitive) {
        const target = split(roles[marker]?.[style] ?? "");
        const newYork = split(roles[marker]?.[SOURCE_STYLE] ?? "");
        for (const token of tokens) {
          const counterpart = findCounterpart(token, target, true);
          if (
            counterpart &&
            usesVariable(counterpart) &&
            !usesVariable(token)
          ) {
            continue;
          }
          const added =
            counterpart && getFamily(token) === "border"
              ? target.filter(
                  (other) =>
                    getUtility(other).variants === getUtility(token).variants &&
                    isAddedBorder(other, newYork),
                )
              : [];
          const value = counterpart
            ? [unimportant(counterpart), ...added].join(" ")
            : "";
          const tally = votes.get(token) ?? new Map<string, number>();
          tally.set(value, (tally.get(value) ?? 0) + 1);
          votes.set(token, tally);
        }
      }
      const map = new Map<string, string>();
      for (const [token, tally] of votes) {
        const total = [...tally.values()].reduce((a, b) => a + b, 0);
        const [best, count] = [...tally].sort((a, b) => b[1] - a[1])[0]!;
        if (best && best !== token && count / total >= 0.5) {
          map.set(token, best);
        }
      }
      return [style, map] as const;
    }),
  );

  // A change every style makes the same way, like `h-4` to `h-6`, is shadcn
  // updating its components rather than a style, so ours keep their value.
  for (const token of new Set(
    styleNames.flatMap((style) => [...fallback[style]!.keys()]),
  )) {
    const values = new Set(
      styleNames.map((style) => fallback[style]!.get(token)),
    );
    if (values.size === 1) {
      for (const style of styleNames) fallback[style]!.delete(token);
    }
  }

  function getFallback(token: string, style: string) {
    if (isColor(token)) return undefined;
    const exact = fallback[style]!.get(token);
    if (exact !== undefined) return exact;
    const { variants, utility } = getUtility(token);
    const mapped = variants ? fallback[style]!.get(utility) : undefined;
    const important = token.endsWith("!") ? "!" : "";
    return mapped
      ?.split(" ")
      .map((value) => `${variants}${unimportant(value)}${important}`)
      .join(" ");
  }

  function findRole(tokens: string[], name: string) {
    const mine = tokens.filter((token) => allSensitive.has(token));
    const kind = getKind(name);
    let role: string | null = null;
    let score = 0;
    for (const [marker, changed] of sensitive) {
      const shared = mine.filter((token) => changed.has(token)).length;
      const sameKind = getKind(marker) === kind;
      if (shared < (sameKind ? 2 : 3)) continue;
      const value =
        shared / mine.length +
        (shared / changed.size) * 0.1 +
        (sameKind ? 0.3 : 0);
      if (value > score) {
        score = value;
        role = marker;
      }
    }
    return score >= 0.6 ? role : null;
  }

  return function generate(
    classes: string,
    style: string,
    name: string,
    hint?: string,
  ) {
    const tokens = split(classes);
    const role = hint && sensitive.has(hint) ? hint : findRole(tokens, name);
    const changed = role ? sensitive.get(role)! : new Set<string>();
    const target = role ? split(roles[role]?.[style] ?? "") : [];
    const newYork = role ? split(roles[role]?.[SOURCE_STYLE] ?? "") : [];
    const rewritten = new Set<string>();
    const result: string[] = [];
    const familyKey = (token: string) =>
      `${getUtility(token).variants}${getFamily(token)}`;

    // The matched part's radius wins over a slightly different one of ours.
    const findRadius = (variants: string) =>
      target.find(
        (other) =>
          getFamily(other) === "rounded" &&
          getUtility(other).variants === variants &&
          !usesVariable(other) &&
          newYork.some(
            (source) =>
              getFamily(source) === "rounded" &&
              getUtility(source).variants === variants &&
              findCounterpart(source, [other]),
          ),
      );
    // A variant the part doesn't style, like `data-[size=sm]:`, takes the
    // part's base radius when it repeats ours.
    const mapRadius = (token: string) => {
      if (!role || getFamily(token) !== "rounded") {
        return split(getFallback(token, style) ?? token);
      }
      const { variants, utility } = getUtility(token);
      const radius = findRadius(variants);
      if (radius) return split(radius);
      const base =
        variants && newYork.includes(utility) ? findRadius("") : undefined;
      return split(
        base
          ? `${variants}${getUtility(base).utility}`
          : (getFallback(token, style) ?? token),
      );
    };

    for (const token of tokens) {
      if (changed.has(token)) {
        const counterpart = findCounterpart(token, target);
        if (
          counterpart &&
          (!usesVariable(counterpart) || usesVariable(token))
        ) {
          result.push(counterpart);
          rewritten.add(familyKey(token));
          continue;
        }
        // A style that moves a background out of `dark:`, like Luma's
        // `bg-input/50`, replaces ours.
        const background =
          !counterpart &&
          getFamily(token) === "bg" &&
          getUtility(token).variants === "dark:"
            ? target.filter(
                (other) =>
                  getFamily(other) === "bg" &&
                  !getUtility(other).variants &&
                  !newYork.includes(other),
              )
            : [];
        if (background.length) {
          result.push(...background);
          continue;
        }
        // Styles drop shadows; anything else the part may get from a parent.
        const dropsShadow =
          !counterpart &&
          getFamily(token) === "shadow" &&
          !target.some((other) => familyKey(other) === familyKey(token));
        if (!dropsShadow) result.push(token);
        continue;
      }
      // A one-sided radius takes the style's size and keeps its side.
      const { variants, utility } = getUtility(token);
      const side = utility.match(SIDE_RADIUS)?.[1];
      if (side) {
        const size = utility.slice(`rounded-${side}`.length);
        if (size === "-none" || size.startsWith("-[")) {
          result.push(token);
          continue;
        }
        const important = token.endsWith("!") ? "!" : "";
        result.push(
          ...mapRadius(`${variants}rounded${size}${important}`).map((value) =>
            value.replace(/(^|:)rounded(?=-|!|$)/, `$1rounded-${side}`),
          ),
        );
        continue;
      }
      result.push(...mapRadius(token));
    }

    for (const other of target) {
      if (rewritten.has(familyKey(other)) && isAddedBorder(other, newYork)) {
        result.push(other);
      }
    }

    return [...new Set(result.map(toSpacingScale))].join(" ");
  };
}

// Hand-tuned rules for a style, in `overrides/style-<name>.css`, win over the
// generated ones, for parts the generator can't get right on its own.
export function getOverridesPath(style: string) {
  return path.join(STYLES_SRC_PATH, "overrides", `style-${style}.css`);
}

async function getOverrides(style: string, markers: Set<string>) {
  const css = await fs
    .readFile(getOverridesPath(style), "utf8")
    .catch(() => "");
  const overrides = getRules(css);
  for (const marker of overrides.keys()) {
    if (!markers.has(marker)) {
      throw new Error(
        `overrides/style-${style}.css overrides ${marker}, which isn't in style-${SOURCE_STYLE}.css`,
      );
    }
  }
  return overrides;
}

export async function syncStyles() {
  const [sourceCss, roles] = await Promise.all([
    fs.readFile(
      path.join(STYLES_SRC_PATH, `style-${SOURCE_STYLE}.css`),
      "utf8",
    ),
    fs
      .readFile(path.join(STYLES_SRC_PATH, "shadcn", "roles.json"), "utf8")
      .then((json) => JSON.parse(json) as Roles),
  ]);
  const generate = createStyleGenerator(roles);
  const markers = new Set(getRules(sourceCss).keys());
  const hints = getRoleHints(sourceCss);
  for (const [marker, role] of hints) {
    if (!roles[role]) {
      throw new Error(`${marker} has @role ${role}, which isn't a shadcn part`);
    }
  }

  await Promise.all(
    STYLES.map(async ({ name }) => {
      const overrides = await getOverrides(name, markers);
      const css = sourceCss
        .replace(`.style-${SOURCE_STYLE} {`, `.style-${name} {`)
        .replace(
          RULE,
          (_, marker: string, classes: string) =>
            `  .${marker} {\n    @apply ${overrides.get(marker) ?? generate(classes, name, marker, hints.get(marker))};\n  }`,
        );
      return writeFileIfChanged(
        path.join(STYLES_SRC_PATH, `style-${name}.css`),
        css,
      );
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await syncStyles();
}
