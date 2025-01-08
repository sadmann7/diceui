import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";
import { compareNodePosition } from "../lib/node";

interface UseItemCollectionProps<TElement extends HTMLElement> {
  ref: React.RefObject<TElement | null>;
  attr?: string;
}

function useItemCollection<TElement extends HTMLElement>({
  ref,
  attr = DATA_ITEM_ATTR,
}: UseItemCollectionProps<TElement>) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(
      collectionNode.querySelectorAll(`[${attr}]`),
    ) satisfies TElement[];

    if (items.length === 0) return [];

    return items.sort(compareNodePosition);
  }, [ref, attr]);

  const getEnabledItems = React.useCallback(() => {
    const items = getItems();
    return items.filter(
      (item) => item.getAttribute("aria-disabled") !== "true",
    );
  }, [getItems]);

  return { getItems, getEnabledItems };
}

export { useItemCollection };
