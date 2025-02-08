import {
  DATA_ITEM_ATTR,
  Primitive,
  composeEventHandlers,
  createContext,
  dispatchDiscreteCustomEvent,
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
const ITEM_SELECT_EVENT = `${ITEM_NAME}.Select.Event`;

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
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.div>,
    "onSelect"
  > {
  /**
   * The value of the item.
   *
   * Cannot be an empty string.
   */
  value: string;

  /**
   * The label of the item. By default, value is used as the label.
   *
   * Override the text value for the selected item in the input.
   */
  label?: string;

  /** Whether the item is disabled. */
  disabled?: boolean;

  /** Callback called when the item is selected. */
  onSelect?: (value: string) => void;
}

const ComboboxItem = React.forwardRef<ItemElement, ComboboxItemProps>(
  (props, forwardedRef) => {
    const { value, label: labelProp, disabled, onSelect, ...itemProps } = props;
    const context = useComboboxContext(ITEM_NAME);
    const groupContext = useComboboxGroupContext(ITEM_NAME, true);
    const { label, onLabelChange } = useLabel<ItemTextElement>({
      defaultValue: labelProp,
    });
    const itemRef = React.useRef<ItemElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, itemRef);
    const isPointerDownRef = React.useRef(false);

    const id = useId();
    const textId = `${id}text`;

    const isSelected = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;
    const isDisabled = disabled || context.disabled || false;

    const onItemSelect = React.useCallback(() => {
      const itemElement = itemRef.current;
      if (!itemElement) return;

      if (onSelect) {
        const selectEvent = new CustomEvent(ITEM_SELECT_EVENT, {
          bubbles: true,
        });

        itemElement.addEventListener(
          ITEM_SELECT_EVENT,
          () => onSelect?.(value),
          {
            once: true,
          },
        );
        dispatchDiscreteCustomEvent(itemElement, selectEvent);
      }

      if (context.multiple) {
        context.onInputValueChange("");
      } else {
        const selectedLabel = label ?? itemElement.textContent ?? "";
        context.onInputValueChange(selectedLabel);
        context.onSelectedTextChange(selectedLabel);
        context.onHighlightedItemChange(null);
        context.onOpenChange(false);
      }

      context.filterStore.search = "";
      context.onValueChange(value);
      context.inputRef.current?.focus();
    }, [
      label,
      value,
      onSelect,
      context.multiple,
      context.onInputValueChange,
      context.onHighlightedItemChange,
      context.onOpenChange,
      context.onSelectedTextChange,
      context.onValueChange,
      context.inputRef,
      context.filterStore,
    ]);

    useIsomorphicLayoutEffect(() => {
      if (value === "") {
        throw new Error(`${ITEM_NAME} value cannot be an empty string.`);
      }

      return context.onItemRegister(
        {
          ref: itemRef,
          label,
          value,
          disabled: isDisabled,
          onSelect,
        },
        groupContext?.id,
      );
    }, [
      label,
      value,
      isDisabled,
      groupContext?.id,
      context.onItemRegister,
      onSelect,
    ]);

    const isVisible = context.getIsItemVisible(value);

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
          role="option"
          id={id}
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          aria-labelledby={textId}
          {...{ [DATA_ITEM_ATTR]: "" }}
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
            onItemSelect();
          })}
          onPointerDown={composeEventHandlers(
            itemProps.onPointerDown,
            (event) => {
              if (isDisabled) return;
              isPointerDownRef.current = true;

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
                event.preventDefault();
              }
            },
          )}
          onPointerUp={composeEventHandlers(itemProps.onPointerUp, (event) => {
            if (!isPointerDownRef.current) event.currentTarget?.click();
            isPointerDownRef.current = false;
          })}
          onPointerMove={composeEventHandlers(itemProps.onPointerMove, () => {
            if (isDisabled) return;

            context.onHighlightedItemChange({
              ref: itemRef,
              label,
              value,
              disabled: isDisabled,
            });
          })}
        />
      </ComboboxItemProvider>
    );
  },
);

ComboboxItem.displayName = ITEM_NAME;

const Item = ComboboxItem;

export { ComboboxItem, Item, useComboboxItemContext, ITEM_SELECT_EVENT };

export type { ComboboxItemProps, ItemElement };
