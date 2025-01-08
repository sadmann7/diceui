import * as React from "react";
import { compareNodePosition } from "../lib/node";

type CollectionItem<TItemElement extends HTMLElement, TItemData = {}> = {
  ref: React.RefObject<TItemElement | null>;
} & TItemData;

type CollectionItemMap<TItemElement extends HTMLElement, TItemData = {}> = Map<
  React.RefObject<TItemElement | null>,
  CollectionItem<TItemElement, TItemData>
>;

type CollectionGroupMap<TItemElement extends HTMLElement> = Map<
  string,
  Set<React.RefObject<TItemElement | null>>
>;

interface CollectionOptions {
  /**
   * Whether to register items into groups.
   * @default false
   */
  grouped?: boolean;
}

function useCollection<TItemElement extends HTMLElement, TItemData = {}>({
  grouped = false,
}: CollectionOptions = {}) {
  const collectionRef = React.useRef<TItemElement | null>(null);
  const itemMap = React.useRef<CollectionItemMap<TItemElement, TItemData>>(
    new Map(),
  ).current;
  const groupMap = grouped
    ? React.useRef<CollectionGroupMap<TItemElement>>(new Map()).current
    : null;

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

  const onItemRegister = React.useCallback(
    (item: CollectionItem<TItemElement, TItemData>, groupId?: string) => {
      itemMap.set(item.ref, item);

      if (grouped && groupId && groupMap) {
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, new Set());
        }
        groupMap.get(groupId)?.add(item.ref);
      }

      return () => {
        itemMap.delete(item.ref);
        if (grouped && groupId && groupMap) {
          const group = groupMap.get(groupId);
          group?.delete(item.ref);
          if (group?.size === 0) {
            groupMap.delete(groupId);
          }
        }
      };
    },
    [itemMap, groupMap, grouped],
  );

  return {
    collectionRef,
    itemMap,
    groupMap,
    getItems,
    onItemRegister,
  };
}

export { useCollection };

export type { CollectionGroupMap, CollectionItem, CollectionItemMap };
