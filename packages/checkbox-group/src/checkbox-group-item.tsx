import {
  BubbleInput,
  Primitive,
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useFormControl,
  useId,
} from "@diceui/shared";
import * as React from "react";
import { useCheckboxGroup } from "./checkbox-group-root";

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
  /** Value of the checkbox. */
  value: string;

  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  /** Whether the checkbox is required. */
  required?: boolean;
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const { value, disabled, required = false, name, ...itemProps } = props;
  const context = useCheckboxGroup(ITEM_NAME);
  const id = useId();
  const isDisabled = disabled || context.disabled || false;
  const isChecked = context.value.includes(value);
  const isRequired =
    (context.required && context.value.length === 0) ||
    (required && !isChecked);
  const { isFormControl, trigger, onTriggerChange } =
    useFormControl<HTMLButtonElement>();
  const composedRef = useComposedRefs(ref, (node) => onTriggerChange(node));
  const lastClickTimeRef = React.useRef(0);
  const hasConsumerStoppedPropagationRef = React.useRef(false);

  return (
    <CheckboxGroupItemProvider
      value={value}
      checked={isChecked}
      disabled={isDisabled}
    >
      <Primitive.button
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        aria-invalid={context.isInvalid}
        data-state={getDataState(isChecked)}
        data-orientation={context.orientation}
        data-disabled={isDisabled ? "" : undefined}
        data-invalid={context.isInvalid ? "" : undefined}
        disabled={isDisabled}
        id={id}
        {...itemProps}
        ref={composedRef}
        onClick={composeEventHandlers(props.onClick, (event) => {
          const now = Date.now();
          // Ignore rapid subsequent clicks (debounce)
          // This prevents event bubbling from clicking on the indicator
          if (now - lastClickTimeRef.current < 50) {
            event.stopPropagation();
            return;
          }
          lastClickTimeRef.current = now;

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
          // Checkbox group items should not trigger on enter key press
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
          readOnly={context.readOnly}
          required={isRequired}
          onReset={() => context.onReset()}
        />
      )}
    </CheckboxGroupItemProvider>
  );
});

function getDataState(checked: boolean) {
  return checked ? "checked" : "unchecked";
}

CheckboxGroupItem.displayName = ITEM_NAME;

const Item = CheckboxGroupItem;

export { CheckboxGroupItem, getDataState, Item, useCheckboxGroupItem };

export type { CheckboxGroupItemContext, CheckboxGroupItemProps };
