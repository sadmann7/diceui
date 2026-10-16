// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { DEFAULT_STYLE } from "@/lib/constants";
import { STYLES } from "@/registry/styles";
import { getRules } from "@/scripts/sync-styles.mts";

const read = (style: string) =>
  readFileSync(path.join(import.meta.dirname, `style-${style}.css`), "utf8");

const defaultMarkers = [...getRules(read(DEFAULT_STYLE)).keys()];

describe.each(STYLES.map((style) => style.name))("style-%s.css", (style) => {
  test("has a rule for every marker in the default style", () => {
    expect([...getRules(read(style)).keys()]).toEqual(defaultMarkers);
  });
});
