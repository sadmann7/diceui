import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";

interface UseCollectionProps {
  ref: React.RefObject<HTMLElement | null>;
  attr?: string;
  disabledAttr?: string;
}

interface CollectionItem<T extends HTMLElement> {
  ref: T;
  value: string;
  disabled: boolean;
}

interface CollectionContextValue<T extends HTMLElement> {
  collectionRef: React.RefObject<T | null>;
  itemMap: Map<React.RefObject<T>, CollectionItem<T>>;
}

function useCollection<T extends HTMLElement>({
  ref,
  attr = DATA_ITEM_ATTR,
}: UseCollectionProps) {
  const getItems = React.useCallback(() => {
    const collectionNode = ref.current;
    if (!collectionNode) return [];

    const items = Array.from(
      collectionNode.querySelectorAll(`[${attr}]`),
    ) as T[];

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
  value: string,
  disabled: boolean,
  context: CollectionContextValue<T>,
) {
  React.useEffect(() => {
    context.itemMap.set(ref, { ref: ref.current, value, disabled });
    return () => {
      context.itemMap.delete(ref);
    };
  }, [ref, value, disabled, context.itemMap]);
}

function getItemValue<T extends HTMLElement>(
  item: T,
  context: CollectionContextValue<T>,
): string {
  for (const [ref, data] of context.itemMap.entries()) {
    if (ref.current === item) {
      return data.value;
    }
  }
  return "";
}

export { useCollection, useCollectionItem, getItemValue };

export type { CollectionItem };
