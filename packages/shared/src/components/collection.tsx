import * as React from "react";
import { DATA_ITEM_ATTR } from "../constants";
import { composeRefs } from "../lib/compose-refs";
import { createContext } from "./create-context";
import { Slot, type SlotProps } from "./slot";

type ItemMap<ItemElement extends HTMLElement, ItemData = {}> = Map<
  React.RefObject<ItemElement | null>,
  { ref: ItemElement | null } & ItemData
>;

interface CollectionContextValue<
  ItemElement extends HTMLElement,
  ItemData = {},
> {
  collectionRef: React.RefObject<HTMLElement | null>;
  itemMap: ItemMap<ItemElement, ItemData>;
}

interface CollectionProps extends SlotProps {}

function createCollection<ItemElement extends HTMLElement, ItemData = {}>(
  name: string,
) {
  const PROVIDER_NAME = `${name}CollectionProvider`;

  const [CollectionProvider, useCollectionContext] =
    createContext<CollectionContextValue<ItemElement, ItemData>>(PROVIDER_NAME);

  const COLLECTION_SLOT_NAME = `${name}CollectionSlot`;

  const CollectionSlot = React.forwardRef<HTMLElement, CollectionProps>(
    (props, forwardedRef) => {
      const { children, ...slotProps } = props;
      const context = useCollectionContext(COLLECTION_SLOT_NAME);
      const composedRefs = composeRefs(forwardedRef, context.collectionRef);

      return (
        <Slot ref={composedRefs} {...slotProps}>
          {children}
        </Slot>
      );
    },
  );

  CollectionSlot.displayName = COLLECTION_SLOT_NAME;

  const ITEM_SLOT_NAME = `${name}CollectionItemSlot`;

  type CollectionItemSlotProps = React.ComponentPropsWithoutRef<typeof Slot> &
    ItemData & {
      children: React.ReactNode;
    };

  const CollectionItemSlot = React.forwardRef<
    ItemElement,
    CollectionItemSlotProps
  >((props, forwardedRef) => {
    const { children, ...itemData } = props;
    const itemRef = React.useRef<ItemElement | null>(null);
    const composedRefs = composeRefs(forwardedRef, itemRef);
    const context = useCollectionContext(ITEM_SLOT_NAME);

    React.useEffect(() => {
      context.itemMap.set(itemRef, {
        ref: itemRef.current,
        ...(itemData as unknown as ItemData),
      });
      return () => void context.itemMap.delete(itemRef);
    });

    return <Slot {...{ [DATA_ITEM_ATTR]: "" }} ref={composedRefs} />;
  });

  CollectionItemSlot.displayName = ITEM_SLOT_NAME;

  function useCollection(name: string) {
    const context = useCollectionContext(name);

    const getItems = React.useCallback(() => {
      const collectionNode = context.collectionRef.current;
      if (!collectionNode) return [];

      const orderedNodes = Array.from(
        collectionNode.querySelectorAll(`[${DATA_ITEM_ATTR}]`),
      );
      const items = Array.from(context.itemMap.values());

      return items.sort(
        (a, b) =>
          orderedNodes.indexOf(
            a?.ref ?? globalThis.document.createElement("div"),
          ) -
          orderedNodes.indexOf(
            b?.ref ?? globalThis.document.createElement("div"),
          ),
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

export type { CollectionProps, ItemMap };
