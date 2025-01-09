import {
  DATA_ITEM_ATTR,
  Primitive,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useId,
  useIsomorphicLayoutEffect,
  useLabel,
} from "@diceui/shared";
import * as React from "react";
import { useComboboxGroupContext } from "./combobox-group";
import type { ItemTextElement } from "./combobox-item-text";
import { useComboboxContext } from "./combobox-root";

const ITEM_NAME = "ComboboxItem";

interface ComboboxItemContextValue {
  value: string;
  isSelected: boolean;
  disabled?: boolean;
  textId: string;
  onItemLabelChange: (node: ItemTextElement | null) => void;
}

const [ComboboxItemProvider, useComboboxItemContext] =
  createContext<ComboboxItemContextValue>(ITEM_NAME);

type ItemElement = React.ElementRef<typeof Primitive.div>;

interface ComboboxItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The value of the item. */
  value: string;

  /** The label of the item. */
  label?: string;

  /** Whether the item is disabled. */
  disabled?: boolean;
}

const ComboboxItem = React.forwardRef<ItemElement, ComboboxItemProps>(
  (props, forwardedRef) => {
    const { value, label: labelProp, disabled, ...itemProps } = props;
    const context = useComboboxContext(ITEM_NAME);
    // Make the group context optional by passing false, so item can be used outside of a group
    const groupContext = useComboboxGroupContext(ITEM_NAME, false);
    const { label, onLabelChange } = useLabel<ItemTextElement>({
      defaultValue: labelProp ?? "",
    });
    const itemRef = React.useRef<ItemElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, itemRef);

    const id = useId();
    const textId = `${id}text`;

    const isSelected = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;
    const isDisabled = disabled || context.disabled || false;

    useIsomorphicLayoutEffect(() => {
      if (value === "") {
        throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
      }

      return context.onItemRegister(
        {
          id,
          label,
          value,
          disabled,
          ref: itemRef,
        },
        groupContext?.id,
      );
    }, [context.onItemRegister, value, disabled, label, groupContext?.id]);

    const isVisible =
      context.manualFiltering ||
      (context.filterStore.search
        ? (context.filterStore.items.get(id) ?? 0) > 0
        : true);

    if (!isVisible) return null;

    return (
      <ComboboxItemProvider
        value={value}
        isSelected={isSelected}
        disabled={disabled}
        textId={textId}
        onItemLabelChange={onLabelChange}
      >
        <Primitive.div
          {...{ [DATA_ITEM_ATTR]: "" }}
          id={id}
          role="option"
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          aria-labelledby={textId}
          data-state={isSelected ? "checked" : "unchecked"}
          data-highlighted={
            context.highlightedItem?.ref.current?.id === id ? "" : undefined
          }
          data-disabled={isDisabled ? "" : undefined}
          tabIndex={disabled ? undefined : -1}
          {...itemProps}
          ref={composedRef}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            if (isDisabled || context.readOnly) return;

            event?.currentTarget.focus();

            if (context.multiple) {
              context.onInputValueChange("");
            } else {
              const text = itemRef.current?.textContent ?? "";
              context.onInputValueChange(text);
              context.onSelectedTextChange(text);
              context.onHighlightedItemChange(null);
              context.onOpenChange(false);
            }

            context.filterStore.search = "";
            context.onValueChange(value);
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
            if (isDisabled) return;
            context.onHighlightedItemChange({
              id,
              label,
              value,
              disabled: isDisabled,
              ref: itemRef,
            });
          })}
        />
      </ComboboxItemProvider>
    );
  },
);

ComboboxItem.displayName = ITEM_NAME;

const Item = ComboboxItem;

export { ComboboxItem, Item, useComboboxItemContext };

export type { ComboboxItemProps, ItemElement };
