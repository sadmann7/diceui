import * as React from "react";
import { DATA_ITEM_ATTR, DATA_VALUE_ATTR } from "../constants";

interface CollectionItem<TElement extends HTMLElement> {
  ref: TElement;
  disabled: boolean;
  value: string;
  label?: string;
}

interface CollectionContextValue<TElement extends HTMLElement> {
  collectionRef: React.RefObject<TElement | null>;
  itemMap: Map<React.RefObject<TElement>, CollectionItem<TElement>>;
}

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

    const orderedItems = items.sort((a, b) => {
      const aIndex = Number(a.getAttribute(attr));
      const bIndex = Number(b.getAttribute(attr));
      return aIndex - bIndex;
    });

    return orderedItems;
  }, [ref, attr]);

  const getEnabledItems = React.useCallback(() => {
    const items = getItems();
    return items.filter(
      (item) => item.getAttribute("aria-disabled") !== "true",
    );
  }, [getItems]);

  return { getItems, getEnabledItems };
}

function useCollectionItem<TElement extends HTMLElement>(
  ref: React.RefObject<TElement>,
  context: CollectionContextValue<TElement>,
  disabled: boolean,
  value: string,
  label?: string,
) {
  React.useEffect(() => {
    context.itemMap.set(ref, { ref: ref.current, label, value, disabled });
    return () => {
      context.itemMap.delete(ref);
    };
  }, [ref, label, value, disabled, context.itemMap]);
}

function getItem<TElement extends HTMLElement>(
  item: TElement,
  context: CollectionContextValue<TElement>,
): CollectionItem<TElement> | null {
  for (const [ref, data] of context.itemMap.entries()) {
    if (ref.current === item) return data;
  }
  return null;
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

    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export { getItem, getSortedItems, useCollection, useCollectionItem };

export type { CollectionContextValue, CollectionItem };
