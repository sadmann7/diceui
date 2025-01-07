import * as React from "react";
import { compareNodePosition } from "../lib/node";

type CollectionItem<TItemElement extends HTMLElement, TItemData = {}> = {
  ref: React.RefObject<TItemElement | null>;
} & TItemData;

type CollectionItemMap<TItemElement extends HTMLElement, TItemData = {}> = Map<
  React.RefObject<TItemElement | null>,
  CollectionItem<TItemElement, TItemData>
>;

function useCollection<TItemElement extends HTMLElement, TItemData = {}>() {
  const collectionRef = React.useRef<TItemElement | null>(null);
  const itemMap = React.useRef<CollectionItemMap<TItemElement, TItemData>>(
    new Map(),
  ).current;

  /** Sort collection items by their DOM position. */
  const getItems = React.useCallback(() => {
    const collectionNode = collectionRef.current;
    if (!collectionNode) return [];

    const items = Array.from(itemMap.values());

    if (items.length === 0) return [];

    return items.sort((a, b) => {
      if (!a?.ref.current || !b?.ref.current) return 0;

      return compareNodePosition(a.ref.current, b.ref.current);
    });
  }, [itemMap]);

  /** Register an item in the collection. */
  const onItemRegister = React.useCallback(
    (item: CollectionItem<TItemElement, TItemData>) => {
      itemMap.set(item.ref, item);
      return () => void itemMap.delete(item.ref);
    },
    [itemMap],
  );

  return { collectionRef, itemMap, getItems, onItemRegister };
}

export { useCollection };

export type { CollectionItem, CollectionItemMap };
