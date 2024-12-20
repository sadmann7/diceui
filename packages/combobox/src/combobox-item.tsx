import {
  ITEM_DATA_ATTR,
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
}

const [ComboboxItemProvider, useComboboxItemContext] =
  createContext<ComboboxItemContextValue>(ITEM_NAME);

interface ComboboxItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
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
          onMouseEnter={composeEventHandlers(itemProps.onMouseEnter, () => {
            if (!isDisabled) return;
            context.onMoveHighlight("next");
          })}
          onMouseLeave={composeEventHandlers(itemProps.onMouseLeave, () => {
            if (!isDisabled) return;
            context.onHighlightedItemChange(null);
          })}
          onClick={composeEventHandlers(itemProps.onClick, () => {
            if (isDisabled) return;
            context.onValueChange(value);
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.onInputValueChange(itemRef.current?.textContent ?? "");
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
