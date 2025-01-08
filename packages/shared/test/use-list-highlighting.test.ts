import { renderHook } from "@testing-library/react";
import type * as React from "react";
import { describe, expect, it, vi } from "vitest";
import type { CollectionItem } from "../src/hooks/use-collection";
import { useListHighlighting } from "../src/hooks/use-list-highlighting";

interface TestItemData {
  value: string;
  disabled: boolean;
  selected?: boolean;
}

describe("useListHighlighting", () => {
  // Helper to create test items
  function createTestItems(
    count: number,
    options: { disabledIndexes?: number[]; selectedIndexes?: number[] } = {},
  ) {
    return Array.from({ length: count }, (_, i) => {
      const div = document.createElement("div");
      div.scrollIntoView = vi.fn();
      return {
        ref: { current: div } as React.RefObject<HTMLDivElement>,
        value: `item-${i + 1}`,
        disabled: options.disabledIndexes?.includes(i) ?? false,
        selected: options.selectedIndexes?.includes(i) ?? false,
      };
    });
  }

  // Base setup for tests
  function setupTest(
    options: {
      items?: CollectionItem<HTMLDivElement, TestItemData>[];
      initialHighlightedIndex?: number;
      loop?: boolean;
    } = {},
  ) {
    const items = options.items ?? createTestItems(5);
    let highlightedItem: CollectionItem<HTMLDivElement, TestItemData> | null =
      null;

    if (options.initialHighlightedIndex !== undefined) {
      const item = items[options.initialHighlightedIndex];
      if (item) {
        highlightedItem = item;
      }
    }

    const onHighlightedItemChange = vi.fn();
    const getItems = vi.fn().mockReturnValue(items);
    const getIsItemDisabled = vi.fn((item) => item.disabled);
    const getIsItemSelected = vi.fn((item) => item.selected ?? false);

    const { result } = renderHook(() =>
      useListHighlighting({
        highlightedItem,
        onHighlightedItemChange,
        getItems,
        getIsItemDisabled,
        getIsItemSelected,
        loop: options.loop,
      }),
    );

    return {
      result,
      items,
      onHighlightedItemChange,
      getItems,
      getIsItemDisabled,
      getIsItemSelected,
    };
  }

  it("should move to next item", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 0,
    });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[1]);
    expect(items[1]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should move to previous item", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 1,
    });

    result.current.onHighlightMove("prev");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[0]);
    expect(items[0]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should skip disabled items when moving next", () => {
    const items = createTestItems(5, { disabledIndexes: [1, 2] });
    const { onHighlightedItemChange, result } = setupTest({
      items,
      initialHighlightedIndex: 0,
    });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[3]);
    expect(items[3]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should skip disabled items when moving previous", () => {
    const items = createTestItems(5, { disabledIndexes: [1, 2] });
    const { onHighlightedItemChange, result } = setupTest({
      items,
      initialHighlightedIndex: 3,
    });

    result.current.onHighlightMove("prev");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[0]);
    expect(items[0]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should move to first item", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 2,
    });

    result.current.onHighlightMove("first");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[0]);
    expect(items[0]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should move to last item", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 0,
    });

    result.current.onHighlightMove("last");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[4]);
    expect(items[4]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should loop to first item when moving next at the end", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 4,
      loop: true,
    });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[0]);
    expect(items[0]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should loop to last item when moving previous at the start", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 0,
      loop: true,
    });

    result.current.onHighlightMove("prev");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[4]);
    expect(items[4]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should stay at last item when moving next without loop", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 4,
      loop: false,
    });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[4]);
    expect(items[4]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should move to selected item", () => {
    const items = createTestItems(5, { selectedIndexes: [2] });
    const { onHighlightedItemChange, result } = setupTest({
      items,
      initialHighlightedIndex: 0,
    });

    result.current.onHighlightMove("selected");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[2]);
    expect(items[2]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should move to first item if no item is selected", () => {
    const { onHighlightedItemChange, items, result } = setupTest({
      initialHighlightedIndex: 2,
    });

    result.current.onHighlightMove("selected");

    expect(onHighlightedItemChange).toHaveBeenCalledWith(items[0]);
    expect(items[0]?.ref.current?.scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
    });
  });

  it("should handle empty items array", () => {
    const { onHighlightedItemChange, result } = setupTest({ items: [] });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).not.toHaveBeenCalled();
  });

  it("should handle all items being disabled", () => {
    const items = createTestItems(3, { disabledIndexes: [0, 1, 2] });
    const { onHighlightedItemChange, result } = setupTest({
      items,
      initialHighlightedIndex: 0,
    });

    result.current.onHighlightMove("next");

    expect(onHighlightedItemChange).not.toHaveBeenCalled();
  });
});
