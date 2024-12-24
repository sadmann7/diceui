import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";

interface CollectionItem<T extends HTMLElement> {
  ref: T;
  disabled: boolean;
  value: string;
  label?: string;
}

interface CollectionContextValue<T extends HTMLElement> {
  collectionRef: React.RefObject<T | null>;
  itemMap: Map<React.RefObject<T>, CollectionItem<T>>;
}

interface UseCollectionParams<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  attr?: string;
}

function useCollection<T extends HTMLElement>({
  ref,
  attr = DATA_ITEM_ATTR,
}: UseCollectionParams<T>) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(
      collectionNode.querySelectorAll(`[${attr}]`),
    ) satisfies T[];

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

function useCollectionItem<T extends HTMLElement>(
  ref: React.RefObject<T>,
  context: CollectionContextValue<T>,
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

function getCollectionItem<T extends HTMLElement>(
  item: T,
  context: CollectionContextValue<T>,
): CollectionItem<T> | null {
  for (const [ref, data] of context.itemMap.entries()) {
    if (ref.current === item) return data;
  }
  return null;
}

export { getCollectionItem, useCollection, useCollectionItem };

export type { CollectionContextValue, CollectionItem };
