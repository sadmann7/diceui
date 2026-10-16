import { promises as fs } from "node:fs";
import path from "node:path";

import { DEFAULT_STYLE } from "../lib/constants";

const STYLES_SRC_PATH = path.join(process.cwd(), "registry", "styles");
const RULE = /^ {2}\.(cn-[\w-]+) \{\n {4}@apply ([^;]+);\n {2}\}$/gm;

function split(cls: string): [string, string] {
  let depth = 0;
  let last = -1;
  for (let i = 0; i < cls.length; i++) {
    const c = cls[i];
    if (c === "[" || c === "(") depth++;
    else if (c === "]" || c === ")") depth--;
    else if (c === ":" && depth === 0) last = i;
  }
  return last === -1
    ? ["", cls]
    : [cls.slice(0, last + 1), cls.slice(last + 1)];
}

export function mapClasses(classes: string, rules: Record<string, string>) {
  return classes
    .split(/\s+/)
    .map((token) => {
      const [variant, raw] = split(token);
      const important = raw.endsWith("!") ? "!" : "";
      const value = important ? raw.slice(0, -1) : raw;

      let mapped = rules[value];
      const side = value.match(
        /^rounded-(t|r|b|l|s|e|tl|tr|br|bl|ss|se|es|ee)-(.+)$/,
      );
      const sideBase = side && rules[`rounded-${side[2]}`];
      if (!mapped && side && sideBase) {
        mapped = sideBase.replace(/^rounded-/, `rounded-${side[1]}-`);
      }

      return mapped ? `${variant}${mapped}${important}` : token;
    })
    .join(" ");
}

export function getRules(css: string) {
  return new Map([...css.matchAll(RULE)].map((m) => [m[1]!, m[2]!]));
}

export async function syncStyles() {
  const defaultCss = await fs.readFile(
    path.join(STYLES_SRC_PATH, `style-${DEFAULT_STYLE}.css`),
    "utf8",
  );
  const rulesByStyle: Record<string, Record<string, string>> = JSON.parse(
    await fs.readFile(path.join(STYLES_SRC_PATH, "style-rules.json"), "utf8"),
  );

  for (const [style, rules] of Object.entries(rulesByStyle)) {
    const file = path.join(STYLES_SRC_PATH, `style-${style}.css`);
    const existing = getRules(await fs.readFile(file, "utf8").catch(() => ""));

    const css = defaultCss
      .replace(`.style-${DEFAULT_STYLE} {`, `.style-${style} {`)
      .replace(RULE, (_, marker: string, classes: string) => {
        const applied = existing.get(marker) ?? mapClasses(classes, rules);
        return `  .${marker} {\n    @apply ${applied};\n  }`;
      });

    await fs.writeFile(file, css);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await syncStyles();
}
