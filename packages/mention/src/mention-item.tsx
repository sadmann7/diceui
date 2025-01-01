import {
  DATA_VALUE_ATTR,
  Primitive,
  composeEventHandlers,
  useComposedRefs,
  useId,
  useIsomorphicLayoutEffect,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const ITEM_NAME = "MentionItem";

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  (props, forwardedRef) => {
    const { value, ...itemProps } = props;
    const context = useMentionContext(ITEM_NAME);
    const id = useId();
    const itemRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, itemRef);
    const isSelected = context.selectedValue === value;
    const isHighlighted = context.highlightedItem === itemRef.current;

    useIsomorphicLayoutEffect(() => {
      if (value === "") {
        throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
      }

      return context.onRegisterItem(id, value);
    }, [id, value, context.onRegisterItem]);

    const onPointerMove = React.useCallback(() => {
      if (!isHighlighted && itemRef.current) {
        context.onHighlightedItemChange(itemRef.current);
      }
    }, [context.onHighlightedItemChange, isHighlighted]);

    const onPointerLeave = React.useCallback(() => {
      if (isHighlighted) {
        context.onHighlightedItemChange(null);
      }
    }, [context.onHighlightedItemChange, isHighlighted]);

    const shouldRender = context.filterStore.search
      ? (context.filterStore.items.get(id) ?? 0) > 0
      : true;

    if (!shouldRender) return null;

    return (
      <Primitive.div
        {...{ [DATA_VALUE_ATTR]: value }}
        id={id}
        role="option"
        aria-selected={isSelected}
        data-selected={isSelected ? "" : undefined}
        data-highlighted={isHighlighted ? "" : undefined}
        {...itemProps}
        ref={composedRef}
        onPointerMove={composeEventHandlers(props.onPointerMove, onPointerMove)}
        onClick={composeEventHandlers(props.onClick, () =>
          context.onItemSelect(value),
        )}
        onPointerLeave={composeEventHandlers(
          props.onPointerLeave,
          onPointerLeave,
        )}
      />
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { MentionItem, Item };

export type { MentionItemProps };
