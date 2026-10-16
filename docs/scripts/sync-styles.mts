import { promises as fs } from "node:fs";
import path from "node:path";
import { twMerge } from "tailwind-merge";

import { STYLES } from "../registry/styles";

// Our markers are written once, in shadcn's New York classes, in
// `style-new-york.css`. Each style is generated from it with what shadcn's own
// components teach (`shadcn/roles.json`, from `pnpm shadcn:sync`): a marker
// that copies a shadcn part takes that part's classes in the style, and other
// classes follow how shadcn's styles change them most of the time.

const STYLES_SRC_PATH = path.join(process.cwd(), "registry", "styles");
const SOURCE_STYLE = "new-york";
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

// The visual family of a class; layout classes have none and never change.
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

// The class in `classes` that does the same job as `token`, if any. Strict
// means the same property, so `p-4` isn't a counterpart of `py-4`.
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

// A border the style adds that New York doesn't have, like Sera's underline
// `border-b-input` next to `border-transparent`.
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

// The part a marker is, by name: `cn-editable-input` -> "input".
const getKind = (marker: string) =>
  marker
    .replace(/(-\d+|-radix)+$/, "")
    .split("-")
    .pop();

export function createStyleGenerator(roles: Roles) {
  const styleNames = STYLES.map((style) => style.name);

  // Per shadcn marker, the New York classes some style changes.
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

  // For classes no shadcn part explains: how most parts change them.
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

  // Prefixed classes like `focus-visible:rounded-md` change like the bare
  // class, keeping their prefix.
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

  // The shadcn part a marker copies: the one explaining most of its visual
  // classes, preferring the same kind of part, with coverage breaking ties.
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

  return function generate(classes: string, style: string, name: string) {
    const tokens = split(classes);
    const role = findRole(tokens, name);
    const changed = role ? sensitive.get(role)! : new Set<string>();
    const target = role ? split(roles[role]?.[style] ?? "") : [];
    const newYork = role ? split(roles[role]?.[SOURCE_STYLE] ?? "") : [];
    const rewritten = new Set<string>();
    const result: string[] = [];
    const familyKey = (token: string) =>
      `${getUtility(token).variants}${getFamily(token)}`;

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
        // Styles drop shadows; anything else the part may get from a parent.
        const dropsShadow =
          !counterpart &&
          getFamily(token) === "shadow" &&
          !target.some((other) => familyKey(other) === familyKey(token));
        if (!dropsShadow) result.push(token);
        continue;
      }
      // The matched part's radius wins over a slightly different one of ours.
      const radius =
        role && getFamily(token) === "rounded"
          ? target.find(
              (other) =>
                getFamily(other) === "rounded" &&
                getUtility(other).variants === getUtility(token).variants &&
                !usesVariable(other) &&
                newYork.some(
                  (source) =>
                    getFamily(source) === "rounded" &&
                    getUtility(source).variants ===
                      getUtility(token).variants &&
                    findCounterpart(source, [other]),
                ),
            )
          : undefined;
      result.push(...split(radius ?? getFallback(token, style) ?? token));
    }

    for (const other of target) {
      if (rewritten.has(familyKey(other)) && isAddedBorder(other, newYork)) {
        result.push(other);
      }
    }

    return [...new Set(result)].join(" ");
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

  await Promise.all(
    STYLES.map(async ({ name }) => {
      const overrides = await getOverrides(name, markers);
      const css = sourceCss
        .replace(`.style-${SOURCE_STYLE} {`, `.style-${name} {`)
        .replace(
          RULE,
          (_, marker: string, classes: string) =>
            `  .${marker} {\n    @apply ${overrides.get(marker) ?? generate(classes, name, marker)};\n  }`,
        );
      return fs.writeFile(path.join(STYLES_SRC_PATH, `style-${name}.css`), css);
    }),
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await syncStyles();
}
