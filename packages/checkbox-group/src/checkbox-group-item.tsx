import {
  composeEventHandlers,
  createContext,
  useComposedRefs,
  useFormControl,
  useId,
  usePrevious,
  useSize,
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
}

const CheckboxGroupItem = React.forwardRef<
  HTMLButtonElement,
  CheckboxGroupItemProps
>((props, ref) => {
  const { value, disabled, name, ...itemProps } = props;
  const context = useCheckboxGroup(ITEM_NAME);
  const id = useId();
  const isDisabled = disabled || context.disabled || false;
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
        type="button"
        role="checkbox"
        aria-checked={isChecked}
        aria-disabled={isDisabled}
        data-state={getState(isChecked)}
        data-disabled={isDisabled ? "" : undefined}
        data-orientation={context.orientation}
        disabled={isDisabled}
        id={id}
        {...itemProps}
        ref={composedRefs}
        onClick={composeEventHandlers(props.onClick, (event) => {
          if (isFormControl) {
            hasConsumerStoppedPropagationRef.current =
              event.isPropagationStopped();
            // if radio is in a form, stop propagation from the button so that we only propagate
            // one click event (from the input). We propagate changes from an input so that native
            // form validation works and form events reflect radio updates.
            if (!hasConsumerStoppedPropagationRef.current)
              event.stopPropagation();
          } else {
            event.preventDefault();
            context.onItemCheckedChange(value, !isChecked);
          }
        })}
      />
      {isFormControl && (
        <BubbleInput
          control={trigger}
          bubbles={!hasConsumerStoppedPropagationRef.current}
          name={name}
          value={value}
          checked={isChecked}
        />
      )}
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

interface BubbleInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "checked"> {
  checked: boolean;
  control: HTMLElement | null;
  bubbles: boolean;
}

const BubbleInput = (props: BubbleInputProps) => {
  const { control, checked, bubbles = true, ...inputProps } = props;
  const ref = React.useRef<HTMLInputElement>(null);
  const prevChecked = usePrevious(checked);
  const controlSize = useSize(control);

  // Bubble checked change to parents (e.g form change event)
  React.useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(
      inputProto,
      "checked",
    ) as PropertyDescriptor;
    const setChecked = descriptor.set;
    if (prevChecked !== checked && setChecked) {
      const event = new Event("click", { bubbles });
      setChecked.call(input, checked);
      input.dispatchEvent(event);
    }
  }, [prevChecked, checked, bubbles]);

  return (
    <input
      type="checkbox"
      aria-hidden
      defaultChecked={checked}
      {...inputProps}
      tabIndex={-1}
      ref={ref}
      style={{
        ...props.style,
        ...controlSize,
        position: "absolute",
        pointerEvents: "none",
        opacity: 0,
        margin: 0,
      }}
    />
  );
};
