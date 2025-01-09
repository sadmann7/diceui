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
    const createRef = (id: string, value: string) => {
      const ref = { current: { id } } as React.RefObject<HTMLElement>;
      itemMap.set(ref, { value, ref });
      return ref;
    };

    // Add test items
    createRef("item1", "Apple");
    createRef("item2", "Banana");
    createRef("item3", "Cherry");
    createRef("item4", "Date");

    // Setup groups
    const group1 = new Set([
      createRef("item5", "Fruits/Orange"),
      createRef("item6", "Fruits/Banana"),
    ]);
    const group2 = new Set([
      createRef("item7", "Vegetables/Carrot"),
      createRef("item8", "Vegetables/Potato"),
    ]);

    groupMap.set("group1", group1);
    groupMap.set("group2", group2);
  });

  it("initializes with empty search state", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    expect(result.current.filterStore.search).toBe("");
    expect(result.current.filterStore.itemCount).toBe(0);
    expect(result.current.filterStore.items.size).toBe(0);
  });

  it("filters items based on exact match", () => {
    const { result } = renderHook(() =>
      useFilterStore({ itemMap, exactMatch: true }),
    );

    result.current.filterStore.search = "Apple";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(1);
    expect(result.current.filterStore.items.get("item1")).toBeDefined();
  });

  it("performs fuzzy matching by default", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "Apl";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBeGreaterThan(0);
    expect(result.current.filterStore.items.get("item1")).toBeDefined();
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

    result.current.filterStore.search = "apple";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBe(1);
    expect(result.current.filterStore.items.get("item1")).toBeDefined();
  });

  it("handles group filtering", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap, groupMap }));

    result.current.filterStore.search = "Fruits";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBeGreaterThan(0);
    expect(result.current.filterStore.groups?.size).toBeGreaterThan(0);
  });

  it("respects manual filtering flag", () => {
    const { result } = renderHook(() =>
      useFilterStore({ itemMap, manualFiltering: true }),
    );

    result.current.filterStore.search = "Apple";
    result.current.onItemsFilter();

    // With manual filtering, it should just return all items
    expect(result.current.filterStore.itemCount).toBe(itemMap.size);
  });

  it("prioritizes exact matches and prefix matches", () => {
    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "Apple";
    result.current.onItemsFilter();

    const exactMatchScore = result.current.filterStore.items.get("item1");
    const nonExactMatchScore = result.current.filterStore.items.get("item2"); // Banana

    expect(exactMatchScore).toBeGreaterThan(nonExactMatchScore || 0);
  });

  it("processes items in batches", () => {
    // Create a large number of items to test batching
    for (let i = 10; i < 300; i++) {
      const ref = {
        current: { id: `item${i}` },
      } as React.RefObject<HTMLElement>;
      itemMap.set(ref, { value: `Test Item ${i}`, ref });
    }

    const { result } = renderHook(() => useFilterStore({ itemMap }));

    result.current.filterStore.search = "Test";
    result.current.onItemsFilter();

    expect(result.current.filterStore.itemCount).toBeGreaterThan(0);
    expect(result.current.filterStore.items.size).toBeGreaterThan(0);
  });
});
