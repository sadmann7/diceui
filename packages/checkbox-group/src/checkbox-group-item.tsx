import { composeEventHandlers, useId } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

const ITEM_NAME = "CheckboxGroupItem";

interface CheckboxGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  /** Value of the checkbox */
  value: string;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state when uncontrolled */
  defaultChecked?: boolean;
  /** Callback when checked state changes */
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const {
    value,
    disabled,
    checked: checkedProp,
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
      data-state={isChecked ? "checked" : "unchecked"}
      data-disabled={isDisabled ? "" : undefined}
      disabled={isDisabled}
      onClick={composeEventHandlers(itemProps.onClick, () => {
        if (isDisabled) return;
        const newValues = isChecked
          ? context.values.filter((v) => v !== value)
          : [...context.values, value];
        context.onValuesChange(newValues);
        onCheckedChange?.(!isChecked);
      })}
      {...itemProps}
    />
  );
});

CheckboxGroupItem.displayName = ITEM_NAME;

const Item = CheckboxGroupItem;

export { Item, CheckboxGroupItem, type CheckboxGroupItemProps };
