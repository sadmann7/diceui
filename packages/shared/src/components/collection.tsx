/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/collection/src/Collection.tsx
 */

import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";
import { composeRefs } from "../lib/compose-refs";
import { createContext } from "./create-context";
import { Slot, type SlotProps } from "./slot";

type CollectionItem<TItemElement extends HTMLElement, TItemData = {}> = {
  ref: React.RefObject<TItemElement | null>;
} & TItemData;

type CollectionItemMap<TItemElement extends HTMLElement, TItemData = {}> = Map<
  React.RefObject<TItemElement | null>,
  CollectionItem<TItemElement, TItemData>
>;

interface CollectionContextValue<
  TItemElement extends HTMLElement,
  TItemData = {},
> {
  collectionRef: React.RefObject<TItemElement | null>;
  itemMap: CollectionItemMap<TItemElement, TItemData>;
}

interface CollectionProps extends SlotProps {}

function createCollection<TItemElement extends HTMLElement, TItemData = {}>(
  name: string,
) {
  const PROVIDER_NAME = `${name}CollectionProvider`;

  const [CollectionProvider, useCollectionContext] =
    createContext<CollectionContextValue<TItemElement, TItemData>>(
      PROVIDER_NAME,
    );

  const COLLECTION_SLOT_NAME = `${name}CollectionSlot`;

  const CollectionSlot = React.forwardRef<HTMLElement, CollectionProps>(
    (props, forwardedRef) => {
      const context = useCollectionContext(COLLECTION_SLOT_NAME);
      const composedRefs = composeRefs(forwardedRef, context.collectionRef);

      return <Slot ref={composedRefs} {...props} />;
    },
  );

  CollectionSlot.displayName = COLLECTION_SLOT_NAME;

  const ITEM_SLOT_NAME = `${name}CollectionItemSlot`;

  type CollectionItemSlotProps = SlotProps &
    TItemData & {
      children: React.ReactNode;
    };

  const CollectionItemSlot = React.forwardRef<
    TItemElement,
    CollectionItemSlotProps
  >((props, forwardedRef) => {
    const { children, ...itemProps } = props;
    const context = useCollectionContext(ITEM_SLOT_NAME);
    const itemRef = React.useRef<TItemElement>(null);
    const composedRef = composeRefs(forwardedRef, itemRef);

    React.useEffect(() => {
      context.itemMap.set(itemRef, {
        ref: itemRef,
        ...(itemProps as unknown as TItemData),
      });
      return () => void context.itemMap.delete(itemRef);
    });

    return (
      <Slot {...{ [DATA_ITEM_ATTR]: "" }} ref={composedRef}>
        {children}
      </Slot>
    );
  });

  CollectionItemSlot.displayName = ITEM_SLOT_NAME;

  function useCollection<TItemElement extends HTMLElement, TItemData = {}>({
    collectionRef,
    itemMap,
  }: CollectionContextValue<TItemElement, TItemData>) {
    const getItems = React.useCallback(() => {
      const collectionNode = collectionRef.current;
      if (!collectionNode) return [];

      const orderedNodes = Array.from(
        collectionNode.querySelectorAll(`[${DATA_ITEM_ATTR}]`),
      );
      const items = Array.from(itemMap.values());

      return items.sort(
        (a, b) =>
          orderedNodes.indexOf(
            a?.ref.current ?? globalThis.document.createElement("div"),
          ) -
          orderedNodes.indexOf(
            b?.ref.current ?? globalThis.document.createElement("div"),
          ),
      );
    }, [collectionRef, itemMap]);

    return { getItems };
  }

  return [
    {
      CollectionProvider,
      CollectionSlot,
      CollectionItemSlot,
    },
    useCollection,
  ] as const;
}

export { createCollection };

export type { CollectionProps, CollectionItemMap, CollectionItem };
