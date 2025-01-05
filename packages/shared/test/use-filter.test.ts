import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useFilter } from "../src/hooks/use-filter";

describe("useFilter", () => {
  describe("startsWith", () => {
    it("handles basic string matching", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.startsWith("hello", "hel")).toBe(true);
      expect(result.current.startsWith("hello", "lo")).toBe(false);
    });

    it("handles empty substring", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.startsWith("hello", "")).toBe(true);
    });

    it("handles case sensitivity", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.startsWith("Hello", "hel")).toBe(true);
      expect(result.current.startsWith("HELLO", "hel")).toBe(true);
    });

    it("handles diacritics", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.startsWith("éléphant", "ele")).toBe(true);
    });

    it("handles gap matching", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.startsWith("hello_world", "hellow")).toBe(true);
      expect(result.current.startsWith("hello-world", "hellow")).toBe(true);
      expect(result.current.startsWith("hello.world", "hellow")).toBe(true);
    });
  });

  describe("endsWith", () => {
    it("handles basic string matching", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.endsWith("hello", "llo")).toBe(true);
      expect(result.current.endsWith("hello", "hel")).toBe(false);
    });

    it("handles empty substring", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.endsWith("hello", "")).toBe(true);
    });

    it("handles case sensitivity", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.endsWith("Hello", "LLO")).toBe(true);
      expect(result.current.endsWith("HELLO", "llo")).toBe(true);
    });

    it("handles gap matching", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.endsWith("hello_world", "world")).toBe(true);
      expect(result.current.endsWith("hello-world", "world")).toBe(true);
      expect(result.current.endsWith("hello.world", "world")).toBe(true);
    });
  });

  describe("contains", () => {
    it("handles basic string matching", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.contains("hello world", "lo wo")).toBe(true);
      expect(result.current.contains("hello world", "world hello")).toBe(false);
    });

    it("handles empty substring", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.contains("hello", "")).toBe(true);
    });

    it("handles case sensitivity", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.contains("Hello World", "O WOR")).toBe(true);
      expect(result.current.contains("HELLO WORLD", "o wor")).toBe(true);
    });

    it("handles gap matching", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.contains("hello_world_test", "world")).toBe(true);
      expect(result.current.contains("hello-world-test", "world")).toBe(true);
      expect(result.current.contains("hello.world.test", "world")).toBe(true);
    });
  });

  describe("fuzzy", () => {
    it("handles basic fuzzy matching", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.fuzzy("hello world", "hlwrd")).toBe(true);
      expect(result.current.fuzzy("hello world", "xyz")).toBe(false);
    });

    it("handles empty pattern", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.fuzzy("hello", "")).toBe(true);
    });

    it("handles empty string", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.fuzzy("", "test")).toBe(false);
    });

    it("handles case sensitivity", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.fuzzy("Hello World", "hw")).toBe(true);
      expect(result.current.fuzzy("HELLO WORLD", "hw")).toBe(true);
    });

    it("handles gap matching", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.fuzzy("hello_world_test", "hwt")).toBe(true);
      expect(result.current.fuzzy("hello-world-test", "hwt")).toBe(true);
      expect(result.current.fuzzy("hello.world.test", "hwt")).toBe(true);
    });
  });

  describe("special characters and normalization", () => {
    it("handles special characters in gap matching", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.contains("hello/world\\test", "world")).toBe(true);
      expect(result.current.contains("hello|world:test", "world")).toBe(true);
      expect(result.current.contains("hello;world,test", "world")).toBe(true);
    });

    it("handles multiple consecutive separators", () => {
      const { result } = renderHook(() => useFilter({ gapMatch: true }));
      expect(result.current.contains("hello___world", "helloworld")).toBe(true);
      expect(result.current.contains("hello...world", "helloworld")).toBe(true);
      expect(result.current.contains("hello   world", "helloworld")).toBe(true);
    });

    it("handles unicode characters", () => {
      const { result } = renderHook(() => useFilter());
      expect(result.current.contains("café", "cafe")).toBe(true);
      expect(result.current.contains("über", "uber")).toBe(true);
      expect(result.current.contains("piñata", "pinata")).toBe(true);
    });
  });
});
