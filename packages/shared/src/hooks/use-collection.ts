import * as React from "react";
import { compareNodePosition } from "../lib/node";

type CollectionItem<TElement extends HTMLElement, TData = {}> = {
  ref: React.RefObject<TElement | null>;
} & TData;

type CollectionItemMap<TElement extends HTMLElement, TData = {}> = Map<
  React.RefObject<TElement | null>,
  CollectionItem<TElement, TData>
>;

type CollectionGroupMap<TElement extends HTMLElement> = Map<
  string,
  Set<React.RefObject<TElement | null>>
>;

interface CollectionOptions {
  /**
   * Whether to register items into groups.
   * @default false
   */
  grouped?: boolean;
}

function useCollection<TElement extends HTMLElement, TData = {}>({
  grouped = false,
}: CollectionOptions = {}) {
  const collectionRef = React.useRef<TElement | null>(null);
  const itemMap = React.useRef<CollectionItemMap<TElement, TData>>(
    new Map(),
  ).current;
  const groupMapRef = React.useRef<CollectionGroupMap<TElement>>(new Map());
  const groupMap = grouped ? groupMapRef.current : null;

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
    (item: CollectionItem<TElement, TData>, groupId?: string) => {
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
