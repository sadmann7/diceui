// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";

import { getRtlDir, getRtlFiles } from "@/scripts/rtl.mts";

const root = path.join(import.meta.dirname, "..", "..");

describe.each(["base", "radix"] as const)("ui-rtl (%s)", (base) => {
  test("matches the ui files run through the shadcn rtl transform", async () => {
    const rtlDir = getRtlDir(root, base);
    const expected = await getRtlFiles(root, base);

    expect(readdirSync(rtlDir).sort()).toEqual([...expected.keys()].sort());
    for (const [name, content] of expected) {
      expect(readFileSync(path.join(rtlDir, name), "utf8")).toBe(content);
    }
  });
});
