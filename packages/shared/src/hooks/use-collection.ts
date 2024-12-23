import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";

interface UseCollectionProps {
  ref: React.RefObject<HTMLElement | null>;
  attr?: string;
  disabledAttr?: string;
}

export function useCollection<T extends HTMLElement>({
  ref,
  attr = DATA_ITEM_ATTR,
}: UseCollectionProps) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(collectionNode.querySelectorAll(`[${attr}]`));

    const orderedItems = items.sort((a, b) => {
      const aIndex = Number(a.getAttribute(attr));
      const bIndex = Number(b.getAttribute(attr));
      return aIndex - bIndex;
    });

    return orderedItems as T[];
  }, [ref, attr]);

  const getEnabledItems = React.useCallback(() => {
    const items = getItems();
    return items.filter(
      (item) => item.getAttribute("aria-disabled") !== "true",
    );
  }, [getItems]);

  return { getItems, getEnabledItems };
}
