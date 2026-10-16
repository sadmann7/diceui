// @vitest-environment node

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { STYLES } from "@/registry/styles";
import {
  createStyleGenerator,
  getOverridesPath,
  getRoleHints,
  getRules,
} from "@/scripts/sync-styles.mts";

const read = (file: string) =>
  readFileSync(path.join(import.meta.dirname, file), "utf8");

const sourceCss = read("style-new-york.css");
const sourceRules = getRules(sourceCss);
const roleHints = getRoleHints(sourceCss);
const generate = createStyleGenerator(JSON.parse(read("shadcn/roles.json")));

describe.each(STYLES.map((style) => style.name))("style-%s.css", (style) => {
  const rules = getRules(read(`style-${style}.css`));
  const overridesPath = getOverridesPath(style);
  const overrides = getRules(
    existsSync(overridesPath) ? readFileSync(overridesPath, "utf8") : "",
  );

  test("has a rule for every marker in style-new-york.css", () => {
    expect([...rules.keys()]).toEqual([...sourceRules.keys()]);
  });

  test("only overrides markers in style-new-york.css", () => {
    for (const marker of overrides.keys()) {
      expect(sourceRules.has(marker), marker).toBe(true);
    }
  });

  test("is up to date with `pnpm styles:sync`", () => {
    for (const [marker, classes] of sourceRules) {
      expect(rules.get(marker), marker).toBe(
        overrides.get(marker) ??
          generate(classes, style, marker, roleHints.get(marker)),
      );
    }
  });
});
