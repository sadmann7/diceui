import {
  Primitive,
  composeEventHandlers,
  composeRefs,
  createContext,
  useId,
} from "@diceui/shared";
import * as React from "react";
import {
  CollectionItemSlot,
  type ItemData,
  useMentionContext,
} from "./mention-root";

const ITEM_NAME = "MentionItem";

interface MentionItemContext extends ItemData {}

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

    const text = textNode?.textContent ?? "";
    const isDisabled = disabled || context.disabled;
    const isSelected = context.value.includes(value);

    const isVisible =
      !context.filterStore.search || context.filterStore.items.has(id);

    if (!isVisible) return null;

    return (
      <MentionItemProvider text={text} value={value} disabled={isDisabled}>
        <CollectionItemSlot text={text} value={value} disabled={isDisabled}>
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
            onClick={composeEventHandlers(itemProps.onClick, () => {
              if (isDisabled) return;
              context.onInputValueChange(`${context.inputValue}${value}`);
              context.onValueChange([...context.value, value]);
              context.onOpenChange(false);
              context.onHighlightedItemChange(null);
              context.filterStore.search = "";
              context.inputRef.current?.focus();
            })}
            onPointerDown={composeEventHandlers(
              itemProps.onPointerDown,
              (event) => {
                if (isDisabled) return;

                // prevent implicit pointer capture
                const target = event.target;
                if (!(target instanceof HTMLElement)) return;
                if (target.hasPointerCapture(event.pointerId)) {
                  target.releasePointerCapture(event.pointerId);
                }

                if (
                  event.button === 0 &&
                  event.ctrlKey === false &&
                  event.pointerType === "mouse"
                ) {
                  // prevent item from stealing focus from the input
                  event.preventDefault();
                }
              },
            )}
            onPointerMove={composeEventHandlers(itemProps.onPointerMove, () => {
              if (isDisabled || !textNode) return;
              context.onHighlightedItemChange({
                text,
                value,
                disabled: isDisabled,
                ref: { current: textNode },
              });
            })}
          />
        </CollectionItemSlot>
      </MentionItemProvider>
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { Item, MentionItem, useMentionItemContext };

export type { MentionItemProps };
