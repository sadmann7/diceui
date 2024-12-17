import { composeEventHandlers, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const ITEM_NAME = "ComboboxItem";

interface ComboboxItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {
  value: string;
  disabled?: boolean;
}

const ComboboxItem = React.forwardRef<HTMLDivElement, ComboboxItemProps>(
  (props, forwardedRef) => {
    const { value, disabled, ...itemProps } = props;
    const context = useComboboxContext(ITEM_NAME);

    const id = useId();
    const isSelected = value === context.value;
    const isDisabled = disabled || context.disabled || false;

    if (value === "") {
      throw new Error("ComboboxItem value cannot be an empty string.");
    }

    return (
      <Primitive.div
        role="option"
        id={id}
        aria-selected={isSelected}
        aria-disabled={isDisabled}
        data-state={isSelected ? "checked" : "unchecked"}
        data-highlighted={isSelected ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        tabIndex={disabled ? undefined : -1}
        {...itemProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(itemProps.onClick, () => {
          if (isDisabled) return;
          context.onValueChange(value);
          context.onOpenChange(false);
        })}
      />
    );
  },
);

ComboboxItem.displayName = ITEM_NAME;

const Item = ComboboxItem;

export { ComboboxItem, Item };

export type { ComboboxItemProps };
