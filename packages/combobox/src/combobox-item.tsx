import {
  DATA_ITEM_ATTR,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useId,
  useLayoutEffect,
} from "@diceui/shared";
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
  textId: string;
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
    const textId = `${id}text`;

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
        textId={textId}
      >
        <Primitive.div
          {...{ [DATA_ITEM_ATTR]: "" }}
          role="option"
          id={id}
          aria-selected={isSelected}
          aria-disabled={isDisabled}
          aria-labelledby={textId}
          data-state={isSelected ? "checked" : "unchecked"}
          data-highlighted={context.highlightedItem?.id === id ? "" : undefined}
          data-value={value}
          data-disabled={isDisabled ? "" : undefined}
          tabIndex={disabled ? undefined : -1}
          {...itemProps}
          ref={composedRefs}
          onClick={composeEventHandlers(itemProps.onClick, (event) => {
            if (isDisabled || context.readOnly) return;

            if (context.multiple) {
              event?.currentTarget.focus();
              context.inputRef.current?.focus();
              context.onInputValueChange("");
              context.filterStore.search = "";
            } else {
              const text = itemRef.current?.textContent ?? "";
              context.onInputValueChange(text);
              context.onSelectedTextChange(text);
              context.onHighlightedItemChange(null);
              context.onOpenChange(false);
              context.inputRef.current?.focus();
            }

            context.onValueChange(value);
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
                context.multiple &&
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
            context.onHighlightedItemChange(itemRef.current);
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
