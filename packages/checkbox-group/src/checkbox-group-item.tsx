import { composeEventHandlers, createContext, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

function getState(checked: boolean) {
  return checked ? "checked" : "unchecked";
}

const ITEM_NAME = "CheckboxGroupItem";

interface CheckboxGroupItemContext {
  value: string;
  disabled: boolean;
  checked: boolean;
}

const [CheckboxGroupItemProvider, useCheckboxGroupItem] =
  createContext<CheckboxGroupItemContext>(ITEM_NAME);

interface CheckboxGroupItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.button>,
    "checked" | "defaultChecked" | "onCheckedChange"
  > {
  /** Value of the checkbox */
  value: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const { value, disabled, ...itemProps } = props;

  const context = useCheckboxGroup(ITEM_NAME);
  const id = useId();
  const isDisabled = disabled || context.disabled || false;
  const isChecked = context.value.includes(value);

  return (
    <CheckboxGroupItemProvider
      value={value}
      checked={isChecked}
      disabled={isDisabled}
    >
      <Primitive.button
        type="button"
        role="checkbox"
        id={id}
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        data-state={getState(isChecked)}
        data-disabled={isDisabled ? "" : undefined}
        data-orientation={context.orientation}
        disabled={isDisabled}
        onClick={composeEventHandlers(itemProps.onClick, () => {
          if (isDisabled) return;
          context.onItemCheckedChange(value, !isChecked);
        })}
        onKeyDown={composeEventHandlers(itemProps.onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        })}
        {...itemProps}
        ref={ref}
      />
    </CheckboxGroupItemProvider>
  );
});

CheckboxGroupItem.displayName = ITEM_NAME;

const Item = CheckboxGroupItem;

export {
  CheckboxGroupItem,
  getState,
  Item,
  useCheckboxGroupItem,
  type CheckboxGroupItemProps,
};
