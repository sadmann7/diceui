import * as React from "react";
import { compareNodePosition } from "../lib/node";

type CollectionItem<TItemElement extends HTMLElement, TItemData = {}> = {
  ref: React.RefObject<TItemElement | null>;
} & TItemData;

type CollectionItemMap<TItemElement extends HTMLElement, TItemData = {}> = Map<
  React.RefObject<TItemElement | null>,
  CollectionItem<TItemElement, TItemData>
>;

interface UseCollectionContextProps<
  TItemElement extends HTMLElement,
  TItemData = {},
> {
  collectionRef: React.RefObject<TItemElement | null>;
  itemMap?: CollectionItemMap<TItemElement, TItemData>;
}

function useCollectionContext<
  TItemElement extends HTMLElement,
  TItemData = {},
>({
  collectionRef,
  itemMap: itemMapProp,
}: UseCollectionContextProps<TItemElement, TItemData>) {
  const itemMap =
    itemMapProp ??
    React.useRef<CollectionItemMap<TItemElement, TItemData>>(new Map()).current;

  const getItems = React.useCallback(() => {
    const collectionNode = collectionRef.current;
    if (!collectionNode) return [];

    const items = Array.from(itemMap.values());
    const fallbackDiv = globalThis.document?.createElement("div");

    return items.sort((a, b) => {
      const aNode = a?.ref.current ?? fallbackDiv;
      const bNode = b?.ref.current ?? fallbackDiv;
      return compareNodePosition(aNode, bNode);
    });
  }, [collectionRef, itemMap]);

  return { getItems, itemMap };
}

export { useCollectionContext };

export type { CollectionItem, CollectionItemMap };
