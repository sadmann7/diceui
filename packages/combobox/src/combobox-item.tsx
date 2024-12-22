import {
  ITEM_DATA_ATTR,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useId,
  useLayoutEffect,
} from "@diceui/shared";
import { useTypeahead } from "@floating-ui/react";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContentContext } from "./combobox-content";
import { ComboboxGroupContext } from "./combobox-group";
import { useComboboxContext } from "./combobox-root";

const ITEM_NAME = "ComboboxItem";

interface ComboboxItemContextValue {
  value: string;
  isSelected: boolean;
  disabled?: boolean;
}

const [ComboboxItemProvider, useComboboxItemContext] =
  createContext<ComboboxItemContextValue>(ITEM_NAME);

interface ComboboxItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  /** The value of the item. */
  value: string;

  /** Whether the item is disabled. */
  disabled?: boolean;
}

const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  (props, forwardedRef) => {
    const { value, disabled, ...itemProps } = props;
    const context = useComboboxContext(ITEM_NAME);
    const contentContext = useComboboxContentContext(ITEM_NAME);
    const groupContext = React.useContext(ComboboxGroupContext);
    const itemRef = React.useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, itemRef);
    const id = useId();

    const isSelected = Array.isArray(context.value)
      ? context.value.includes(value)
      : context.value === value;
    const isDisabled = disabled || context.disabled || false;

    useLayoutEffect(() => {
      if (value === "") {
        throw new Error("ComboboxItem value cannot be an empty string.");
      }

      return context.onRegisterItem(id, value, groupContext?.id);
    }, [id, value, context.onRegisterItem, groupContext?.id]);

    const shouldRender =
      contentContext.forceMount ||
      (context.filterStore.search
        ? (context.filterStore.items.get(id) ?? 0) > 0
        : true);

    if (!shouldRender) return null;

    return (
      <ComboboxItemProvider
        value={value}
        isSelected={isSelected}
        disabled={disabled}
      >
        <Primitive.div
          {...{ [ITEM_DATA_ATTR]: "" }}
          role="option"
          id={id}
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          data-state={isSelected ? "checked" : "unchecked"}
          data-highlighted={context.highlightedItem?.id === id ? "" : undefined}
          data-value={value}
          data-disabled={isDisabled ? "" : undefined}
          tabIndex={disabled ? undefined : -1}
          {...itemProps}
          ref={composedRefs}
          onPointerMove={composeEventHandlers(itemProps.onPointerMove, () => {
            if (isDisabled) return;
            context.onHighlightedItemChange(itemRef.current);
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

              // prevent focus only for multiple selection mode
              if (context.multiple) {
                event.preventDefault();
              }
            },
          )}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            if (isDisabled) return;

            event.currentTarget.focus();
            context.onValueChange(value);

            if (context.multiple) {
              context.inputRef.current?.focus();
            } else {
              context.onHighlightedItemChange(null);
              context.onInputValueChange(itemRef.current?.textContent ?? "");
            }
          })}
        />
      </ComboboxItemProvider>
    );
  },
);

ComboboxItem.displayName = ITEM_NAME;

const Item = ComboboxItem;

export { ComboboxItem, Item, useComboboxItemContext };

export type { ComboboxItemProps };
