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

interface MentionItemContext extends ItemData {}

const [MentionItemProvider, useMentionItemContext] =
  createContext<MentionItemContext>(ITEM_NAME);

interface MentionItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
  label?: string;
  disabled?: boolean;
}

const MentionItem = React.forwardRef<HTMLDivElement, MentionItemProps>(
  (props, forwardedRef) => {
    const { value, label: labelProp, disabled = false, ...itemProps } = props;
    const context = useMentionContext(ITEM_NAME);
    const [textNode, setTextNode] = React.useState<HTMLDivElement | null>(null);
    const composedRef = composeRefs(forwardedRef, (node) => setTextNode(node));
    const id = useId();

    const label = labelProp ?? textNode?.textContent ?? "";
    const isDisabled = disabled || context.disabled;
    const isSelected = context.value.includes(value);

    useIsomorphicLayoutEffect(() => {
      return context.onItemRegister({
        value,
        label,
        disabled: isDisabled,
        ref: { current: textNode },
      });
    }, [context.onItemRegister, label, value, isDisabled, textNode]);

    const isVisible =
      !context.filterStore.search ||
      (context.filterStore.items.get(id) ?? 0) > 0;

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
            if (isDisabled || !textNode) return;
            context.onHighlightedItemChange({
              label,
              value,
              disabled: isDisabled,
              ref: { current: textNode },
            });
          })}
        />
      </MentionItemProvider>
    );
  },
);

MentionItem.displayName = ITEM_NAME;

const Item = MentionItem;

export { Item, MentionItem, useMentionItemContext };

export type { MentionItemProps };
