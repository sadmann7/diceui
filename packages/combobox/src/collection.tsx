/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/collection/src/Collection.tsx
 */

import { useComposedRefs } from "@diceui/shared";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

type SlotProps = React.ComponentPropsWithoutRef<typeof Slot>;
type CollectionElement = HTMLElement;

interface CollectionProps extends SlotProps {}

function createCollection<ItemElement extends HTMLElement, ItemData = {}>(
  name: string,
) {
  const PROVIDER_NAME = `${name}CollectionProvider`;
  const COLLECTION_SLOT_NAME = `${name}CollectionSlot`;
  const ITEM_SLOT_NAME = `${name}CollectionItemSlot`;
  const ITEM_DATA_ATTR = "data-dice-collection-item";

  type ContextValue = {
    collectionRef: React.RefObject<CollectionElement | null>;
    itemMap: Map<
      React.RefObject<ItemElement | null>,
      { ref: React.RefObject<ItemElement | null> } & ItemData
    >;
  };

  const CollectionContext = React.createContext<ContextValue>({
    collectionRef: { current: null },
    itemMap: new Map(),
  });

  const CollectionProvider: React.FC<{ children?: React.ReactNode }> = ({
    children,
  }) => {
    const ref = React.useRef<CollectionElement>(null);
    const itemMap = React.useRef<ContextValue["itemMap"]>(new Map()).current;

    const value = React.useMemo(
      () => ({
        collectionRef: ref,
        itemMap,
      }),
      [itemMap],
    );

    return (
      <CollectionContext.Provider value={value}>
        {children}
      </CollectionContext.Provider>
    );
  };
  CollectionProvider.displayName = PROVIDER_NAME;

  const CollectionSlot = React.forwardRef<CollectionElement, CollectionProps>(
    (props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const context = React.useContext(CollectionContext);
      const composedRefs = useComposedRefs(forwardedRef, context.collectionRef);

      return (
        <Slot {...slotProps} ref={composedRefs}>
          {children}
        </Slot>
      );
    },
  );
  CollectionSlot.displayName = COLLECTION_SLOT_NAME;

  type CollectionItemSlotProps = ItemData & {
    children: React.ReactNode;
  };

  const CollectionItemSlot = React.forwardRef<
    ItemElement,
    CollectionItemSlotProps
  >((props, forwardedRef) => {
    const { children, ...itemData } = props;
    const ref = React.useRef<ItemElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, ref);
    const context = React.useContext(CollectionContext);

    React.useEffect(() => {
      context.itemMap.set(ref, { ref, ...(itemData as unknown as ItemData) });
      return () => void context.itemMap.delete(ref);
    });

    return (
      <Slot {...{ [ITEM_DATA_ATTR]: "" }} ref={composedRefs}>
        {children}
      </Slot>
    );
  });
  CollectionItemSlot.displayName = ITEM_SLOT_NAME;

  function useCollection() {
    const context = React.useContext(CollectionContext);

    const getItems = React.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];

      const orderedNodes = Array.from(
        collectionNode.querySelectorAll(`[${ITEM_DATA_ATTR}]`),
      );
      const items = Array.from(context.itemMap.values());

      return items.sort(
        (a, b) =>
          orderedNodes.indexOf(a.ref.current ?? document.createElement("div")) -
          orderedNodes.indexOf(b.ref.current ?? document.createElement("div")),
      );
    }, [context.collectionRef, context.itemMap]);

    return { getItems };
  }

  return [
    {
      Provider: CollectionProvider,
      Slot: CollectionSlot,
      ItemSlot: CollectionItemSlot,
    },
    useCollection,
  ] as const;
}

export { createCollection };

export type { CollectionProps };
