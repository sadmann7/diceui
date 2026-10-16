// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { STYLES } from "@/registry/styles";
import { createStyleGenerator, getRules } from "@/scripts/sync-styles.mts";

const read = (file: string) =>
  readFileSync(path.join(import.meta.dirname, file), "utf8");

const sourceRules = getRules(read("style-new-york.css"));
const generate = createStyleGenerator(JSON.parse(read("shadcn/roles.json")));

describe.each(STYLES.map((style) => style.name))("style-%s.css", (style) => {
  const rules = getRules(read(`style-${style}.css`));

  test("has a rule for every marker in style-new-york.css", () => {
    expect([...rules.keys()]).toEqual([...sourceRules.keys()]);
  });

  test("is up to date with `pnpm styles:sync`", () => {
    for (const [marker, classes] of sourceRules) {
      expect(rules.get(marker), marker).toBe(generate(classes, style, marker));
    }
  });
});
