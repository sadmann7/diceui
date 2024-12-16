import * as React from "react";
import { DATA_DISABLED_ATTR, ITEM_DATA_ATTR } from "../constants";

interface UseCollectionProps {
  ref: React.RefObject<HTMLElement | null>;
  attribute?: string;
  disabledAttribute?: string;
}

export function useCollection<T extends HTMLElement>({
  ref,
  attribute = ITEM_DATA_ATTR,
  disabledAttribute = DATA_DISABLED_ATTR,
}: UseCollectionProps) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(collectionNode.querySelectorAll(`[${attribute}]`));

    const orderedItems = items.sort((a, b) => {
      const aIndex = Number(a.getAttribute(attribute));
      const bIndex = Number(b.getAttribute(attribute));
      return aIndex - bIndex;
    });

    return orderedItems as T[];
  }, [ref, attribute]);

  const getEnabledItems = React.useCallback(() => {
    const items = getItems();
    return items.filter((item) => !item.hasAttribute(disabledAttribute));
  }, [getItems, disabledAttribute]);

  return { getItems, getEnabledItems };
}
