import * as React from "react";
import type { HighlightingDirection } from "../types";
import type { CollectionItem } from "./use-collection";

interface UseListHighlightingOptions<TElement extends HTMLElement, TData = {}> {
  highlightedItem: CollectionItem<TElement, TData> | null;
  onHighlightedItemChange: (
    item: CollectionItem<TElement, TData> | null,
  ) => void;
  getItems: () => CollectionItem<TElement, TData>[];
  getIsItemDisabled: (item: CollectionItem<TElement, TData>) => boolean;
  getIsItemSelected: (item: CollectionItem<TElement, TData>) => boolean;
  loop?: boolean;
}

function useListHighlighting<TElement extends HTMLElement, TData = {}>({
  highlightedItem,
  onHighlightedItemChange,
  getItems,
  getIsItemDisabled,
  getIsItemSelected,
  loop = false,
}: UseListHighlightingOptions<TElement, TData>) {
  const onHighlightMove = React.useCallback(
    (direction: HighlightingDirection) => {
      const items = getItems().filter((item) => !getIsItemDisabled(item));

      if (items.length === 0) return;

      const currentIndex = items.findIndex(
        (item) => item.ref.current === highlightedItem?.ref.current,
      );

      let nextIndex: number;
      const lastIndex = items.length - 1;

      switch (direction) {
        case "next": {
          nextIndex = currentIndex + 1;
          nextIndex =
            nextIndex > lastIndex ? (loop ? 0 : lastIndex) : nextIndex;
          break;
        }
        case "prev": {
          nextIndex = currentIndex - 1;
          nextIndex = nextIndex < 0 ? (loop ? lastIndex : 0) : nextIndex;
          break;
        }
        case "first":
          nextIndex = 0;
          break;
        case "last":
          nextIndex = lastIndex;
          break;
        case "selected": {
          nextIndex = items.findIndex(getIsItemSelected);
          nextIndex = nextIndex === -1 ? 0 : nextIndex;
          break;
        }
      }

      const nextItem = items[nextIndex];
      if (nextItem?.ref.current) {
        nextItem.ref.current.scrollIntoView({ block: "nearest" });
        onHighlightedItemChange(nextItem);
      }
    },
    [
      getItems,
      getIsItemSelected,
      getIsItemDisabled,
      highlightedItem,
      onHighlightedItemChange,
      loop,
    ],
  );

  return { onHighlightMove };
}

export { useListHighlighting };
