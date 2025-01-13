import {
  DATA_ITEM_ATTR,
  Primitive,
  composeEventHandlers,
  composeRefs,
  createContext,
  useId,
  useIsomorphicLayoutEffect,
} from "@diceui/shared";
import * as React from "react";
import { type ItemData, useMentionContext } from "./mention-root";

const ITEM_NAME = "MentionItem";

type ItemElement = React.ElementRef<typeof Primitive.div>;

interface MentionItemContext extends ItemData {}

const [MentionItemProvider, useMentionItemContext] =
  createContext<MentionItemContext>(ITEM_NAME);

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /**
   * The value of the item.
   *
   * Cannot be an empty string.
   */
  value: string;

  /**
   * The label of the item. By default value is used as label.
   *
   * Override the text value for mention item in the input.
   */
  label?: string;

  /** Whether the item is disabled. */
  disabled?: boolean;
}

const MentionItem = React.forwardRef<ItemElement, MentionItemProps>(
  (props, forwardedRef) => {
    const { value, label: labelProp, disabled = false, ...itemProps } = props;
    const context = useMentionContext(ITEM_NAME);
    const [itemNode, setItemNode] = React.useState<ItemElement | null>(null);
    const composedRef = composeRefs(forwardedRef, (node) => setItemNode(node));
    const id = useId();

    const label = labelProp ?? value;
    const isDisabled = disabled || context.disabled;
    const isSelected = context.value.includes(value);

    useIsomorphicLayoutEffect(() => {
      if (value === "") {
        throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
      }

      return context.onItemRegister({
        ref: { current: itemNode },
        value,
        label,
        disabled: isDisabled,
      });
    }, [context.onItemRegister, label, value, isDisabled, itemNode]);

    const isVisible = context.getIsItemVisible(value);

    if (!isVisible) return null;

    return (
      <MentionItemProvider label={label} value={value} disabled={isDisabled}>
        <Primitive.div
          {...{ [DATA_ITEM_ATTR]: "" }}
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
            const input = context.inputRef.current;
            if (!input) return;

            const selectionStart = input.selectionStart ?? 0;
            const lastTriggerIndex = input.value.lastIndexOf(
              context.trigger,
              selectionStart,
            );

            if (lastTriggerIndex !== -1) {
              context.onMentionAdd(value, lastTriggerIndex);
            }

            input.focus();
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
            if (isDisabled || !itemNode) return;
            context.onHighlightedItemChange({
              ref: { current: itemNode },
              label,
              value,
              disabled: isDisabled,
            });
          })}
        />
      </MentionItemProvider>
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { MentionItem, Item, useMentionItemContext };

export type { MentionItemProps, ItemElement };
