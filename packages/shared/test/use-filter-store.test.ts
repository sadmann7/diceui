import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { CollectionItem } from "../src/hooks/use-collection";
import { useFilterStore } from "../src/hooks/use-filter-store";

describe("useFilterStore", () => {
  let itemMap: Map<
    React.RefObject<HTMLElement>,
    CollectionItem<HTMLElement, { value: string }>
  >;
  let groupMap: Map<string, Set<React.RefObject<HTMLElement>>>;

  beforeEach(() => {
    // Setup test data
    itemMap = new Map();
    groupMap = new Map();

    // Create refs and items
    const createRef = (_id: string, value: string) => {
      const ref = { current: { id: value } } as React.RefObject<HTMLElement>;
      const item = { value, ref } as CollectionItem<
        HTMLElement,
        { value: string }
      >;
      itemMap.set(ref, item);
      return ref;
    };

    // Add basic tricks
    createRef("trick1", "Kickflip");
    createRef("trick2", "Heelflip");
    createRef("trick3", "Tre Flip");
    createRef("trick4", "FS 540");

    // Setup groups with special tricks
    const group1 = new Set([
      createRef("special1", "The 900"),
      createRef("special2", "Indy Backflip"),
    ]);
    const group2 = new Set([
      createRef("special3", "Pizza Guy"),
      createRef("special4", "360 Varial McTwist"),
    ]);

    groupMap.set("advanced", group1);
    groupMap.set("expert", group2);
  });

  it("initializes with empty search state", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    expect(result.current.filterStore.search).toBe("");
    expect(result.current.filterStore.itemCount).toBe(0);
    expect(result.current.filterStore.items.size).toBe(0);
  });

  it("assigns correct scores based on match type", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    // Test exact match (score should be 2)
    result.current.filterStore.search = "Kickflip";
    result.current.onItemsFilter();
    const exactMatchScore = result.current.filterStore.items.get("Kickflip");
    expect(exactMatchScore).toBe(2);

    // Test prefix match (score should be 1.5)
    result.current.filterStore.search = "Kick";
    result.current.onItemsFilter();
    const prefixMatchScore = result.current.filterStore.items.get("Kickflip");
    expect(prefixMatchScore).toBe(1.5);

    // Test fuzzy match (score should be 1)
    result.current.filterStore.search = "kckflp";
    result.current.onItemsFilter();
    const fuzzyMatchScore = result.current.filterStore.items.get("Kickflip");
    expect(fuzzyMatchScore).toBe(1);
  });

  it("filters items based on exact match", () => {
    const { result } = renderHook(() =>
      useFilterStore({ itemMap, exactMatch: true }),
    );

    result.current.filterStore.search = "Kickflip";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(1);
    expect(result.current.filterStore.items.get("Kickflip")).toBeDefined();
  });

  it("performs fuzzy matching by default", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "kckflp";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBeGreaterThan(0);
    expect(result.current.filterStore.items.get("Kickflip")).toBeDefined();
  });

  it("handles empty search term", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(itemMap.size);
  });

  it("supports custom filter function", () => {
    const customFilter = (options: string[], term: string) =>
      options.filter((opt) => opt.toLowerCase() === term.toLowerCase());

    const { result } = renderHook(() =>
      useFilterStore({ itemMap, onFilter: customFilter }),
    );

    result.current.filterStore.search = "kickflip";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(1);
    expect(result.current.filterStore.items.get("Kickflip")).toBeDefined();
  });

  it("handles group filtering efficiently", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap, groupMap }));

    result.current.filterStore.search = "900";
    result.current.onItemsFilter();

    // We should have matches in the advanced group
    expect(result.current.filterStore.itemCount).toBeGreaterThan(0);

    // Check that the items are properly scored
    const trickScore = result.current.filterStore.items.get("The 900");
    expect(trickScore).toBeDefined();

    // Verify groups are properly filtered
    expect(result.current.filterStore.groups?.size).toBe(1);
    expect(result.current.filterStore.groups?.has("advanced")).toBe(true);
    expect(result.current.filterStore.groups?.has("expert")).toBe(false);
  });

  it("respects manual filtering flag", () => {
    const { result } = renderHook(() =>
      useFilterStore({ itemMap, manualFiltering: true }),
    );

    result.current.filterStore.search = "Kickflip";
    result.current.onItemsFilter();

    // With manual filtering, it should just return all items
    expect(result.current.filterStore.itemCount).toBe(itemMap.size);
    expect(result.current.getIsItemVisible("Kickflip")).toBe(true);
    expect(result.current.getIsItemVisible("Heelflip")).toBe(true);
  });

  it("processes items in batches of 250", () => {
    // Clear existing items first
    itemMap.clear();

    // Create exactly 500 items to test batching
    for (let i = 0; i < 500; i++) {
      const ref = {
        current: { id: `trick${i}` },
      } as React.RefObject<HTMLElement>;
      itemMap.set(ref, { value: `Trick ${i}`, ref });
    }

    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "Trick";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(500); // All items with "Trick" should match
    expect(result.current.filterStore.items.size).toBe(500);

    // Verify that items are properly scored
    const scores = Array.from(result.current.filterStore.items.values());
    expect(scores.every((score) => score > 0)).toBe(true);
  });

  it("correctly identifies empty lists", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    // Non-empty case
    result.current.filterStore.search = "Kickflip";
    result.current.onItemsFilter();
    expect(result.current.getIsListEmpty()).toBe(false);

    // Empty case with search
    result.current.filterStore.search = "NonExistentTrick";
    result.current.onItemsFilter();
    expect(result.current.getIsListEmpty()).toBe(true);

    // Empty case with manual flag
    expect(result.current.getIsListEmpty(true)).toBe(true);
  });
});
