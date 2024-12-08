import { composeEventHandlers, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { type CheckedState, useCheckboxGroup } from "./checkbox-group-root";

const ITEM_NAME = "CheckboxGroupItem";

interface CheckboxGroupItemProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.button>,
    "defaultChecked"
  > {
  /** Value of the checkbox */
  value: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is checked */
  checked?: CheckedState;
  /** Default checked state when uncontrolled */
  defaultChecked?: CheckedState;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: CheckedState) => void;
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const {
    value,
    disabled,
    checked: checkedProp = false,
    defaultChecked,
    onCheckedChange,
    ...itemProps
  } = props;

  const context = useCheckboxGroup(ITEM_NAME);
  const id = useId();
  const isDisabled = disabled || context.disabled;
  const isChecked = context.values.includes(value);

  return (
    <Primitive.button
      ref={ref}
      type="button"
      role="checkbox"
      id={id}
      aria-checked={isChecked}
      aria-disabled={isDisabled}
      data-state={checkedProp}
      data-disabled={isDisabled ? "" : undefined}
      onClick={composeEventHandlers(itemProps.onClick, () => {
        if (isDisabled) return;
        const newValues = isChecked
          ? context.values.filter((v) => v !== value)
          : [...context.values, value];
        context.onValuesChange(newValues);
        onCheckedChange?.(!isChecked);
      })}
      onKeyDown={composeEventHandlers(itemProps.onKeyDown, (event) => {
        // According to WAI ARIA, Checkboxes don't activate on enter keypress
        if (event.key === "Enter") event.preventDefault();
      })}
      disabled={isDisabled}
      {...itemProps}
    />
  );
});

CheckboxGroupItem.displayName = ITEM_NAME;

const Item = CheckboxGroupItem;

export { CheckboxGroupItem, Item, type CheckboxGroupItemProps };
