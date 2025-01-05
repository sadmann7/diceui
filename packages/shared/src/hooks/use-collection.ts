import * as React from "react";
import { DATA_ITEM_ATTR, DATA_VALUE_ATTR } from "../constants";
import { compareNodePosition } from "../lib/node";

interface UseCollectionParams<TElement extends HTMLElement> {
  ref: React.RefObject<TElement | null>;
  attr?: string;
}

function useCollection<TElement extends HTMLElement>({
  ref,
  attr = DATA_ITEM_ATTR,
}: UseCollectionParams<TElement>) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(
      collectionNode.querySelectorAll(`[${attr}]`),
    ) satisfies TElement[];

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

function getSortedItems<TElement extends HTMLElement>(
  items: TElement[],
  value?: string[],
) {
  if (!value?.length) return items;

  return items.sort((a, b) => {
    const aValue = a.getAttribute(DATA_VALUE_ATTR);
    const bValue = b.getAttribute(DATA_VALUE_ATTR);
    const aIndex = value.indexOf(aValue ?? "");
    const bIndex = value.indexOf(bValue ?? "");

    if (aIndex === -1 && bIndex === -1) return compareNodePosition(a, b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    if (aIndex !== bIndex) return aIndex - bIndex;
    return compareNodePosition(a, b);
  });
}

export { getSortedItems, useCollection };
