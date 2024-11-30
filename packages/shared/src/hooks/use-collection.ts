import * as React from "react";

interface UseCollectionProps {
  ref: React.RefObject<HTMLElement>;
  attribute?: string;
  disabledAttribute?: string;
}

export function useCollection<T extends HTMLElement>({
  ref,
  attribute = "data-dice-collection-item",
  disabledAttribute = "data-disabled",
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
    return getItems().filter((item) => !item.hasAttribute(disabledAttribute));
  }, [getItems, disabledAttribute]);

  return { getItems, getEnabledItems };
}
