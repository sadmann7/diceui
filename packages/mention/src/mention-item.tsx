import {
  Primitive,
  composeEventHandlers,
  composeRefs,
  createContext,
  useId,
} from "@diceui/shared";
import * as React from "react";
import { ItemSlot, useMentionContext } from "./mention-root";

const ITEM_NAME = "MentionItem";

interface MentionItemContext {
  textValue: string;
  value: string;
  disabled: boolean;
}

const [MentionItemProvider, useMentionItemContext] =
  createContext<MentionItemContext>(ITEM_NAME);

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
  disabled?: boolean;
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  (props, forwardedRef) => {
    const { value, disabled = false, ...itemProps } = props;
    const context = useMentionContext(ITEM_NAME);
    const [textNode, setTextNode] = React.useState<HTMLDivElement | null>(null);
    const composedRef = composeRefs(forwardedRef, (node) => setTextNode(node));
    const id = useId();

    const textValue = textNode?.textContent ?? "";
    const isDisabled = disabled || context.disabled;
    const isSelected = context.value.includes(value);

    const isVisible =
      !context.filterStore.search || context.filterStore.items.has(id);

    if (!isVisible) return null;

    return (
      <MentionItemProvider
        textValue={textValue}
        value={value}
        disabled={isDisabled}
      >
        <ItemSlot textValue={textValue} value={value} disabled={isDisabled}>
          <Primitive.div
            id={id}
            role="option"
            aria-selected={isSelected}
            data-selected={isSelected ? "" : undefined}
            data-highlighted={
              context.highlightedItem?.ref.current?.id === id ? "" : undefined
            }
            data-disabled={isDisabled ? "" : undefined}
            {...itemProps}
            ref={composedRef}
            onPointerMove={composeEventHandlers(itemProps.onPointerMove, () => {
              if (isDisabled) return;
              context.onHighlightedItemChange(
                textNode
                  ? {
                      ref: { current: textNode },
                      value,
                      textValue,
                      disabled: isDisabled,
                    }
                  : null,
              );
            })}
            onClick={composeEventHandlers(itemProps.onClick, () => {
              if (isDisabled) return;
              context.onItemSelect(value);
            })}
          />
        </ItemSlot>
      </MentionItemProvider>
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { Item, MentionItem, useMentionItemContext };

export type { MentionItemProps };
