import {
  BubbleInput,
  DATA_ITEM_ATTR,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useFormControl,
  useId,
} from "@diceui/shared";
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

  /** Whether the checkbox is required */
  required?: boolean;
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const { value, disabled, required, name, ...itemProps } = props;
  const context = useCheckboxGroup(ITEM_NAME);
  const id = useId();
  const isDisabled = disabled || context.disabled || false;
  const isRequired = required || context.required || false;
  const isChecked = context.value.includes(value);
  const { isFormControl, trigger, onTriggerChange } =
    useFormControl<HTMLButtonElement>();
  const composedRefs = useComposedRefs(ref, (node) => onTriggerChange(node));
  const hasConsumerStoppedPropagationRef = React.useRef(false);

  return (
    <CheckboxGroupItemProvider
      value={value}
      checked={isChecked}
      disabled={isDisabled}
    >
      <Primitive.button
        {...{ [DATA_ITEM_ATTR]: "" }}
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        aria-invalid={context.isInvalid}
        data-state={getState(isChecked)}
        data-orientation={context.orientation}
        data-disabled={isDisabled ? "" : undefined}
        data-invalid={context.isInvalid ? "" : undefined}
        disabled={isDisabled}
        id={id}
        {...itemProps}
        ref={composedRefs}
        onClick={composeEventHandlers(props.onClick, (event) => {
          event.preventDefault();
          context.onItemCheckedChange(value, !isChecked);

          if (isFormControl) {
            hasConsumerStoppedPropagationRef.current =
              event.isPropagationStopped();
            // Stop button click propagation in forms to ensure only the input's event is triggered,
            // allowing native validation and reflecting checkbox updates.
            if (!hasConsumerStoppedPropagationRef.current)
              event.stopPropagation();
          }
        })}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key === "Enter") event.preventDefault();
        })}
      />
      {isFormControl && (
        <BubbleInput
          type="checkbox"
          control={trigger}
          bubbles={!hasConsumerStoppedPropagationRef.current}
          name={name}
          value={value}
          checked={isChecked}
          disabled={isDisabled}
          required={isRequired}
        />
      )}
    </CheckboxGroupItemProvider>
  );
});

CheckboxGroupItem.displayName = ITEM_NAME;

const Item = CheckboxGroupItem;

export { CheckboxGroupItem, Item, getState, useCheckboxGroupItem };

export type { CheckboxGroupItemContext, CheckboxGroupItemProps };
