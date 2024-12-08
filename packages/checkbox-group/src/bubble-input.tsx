import { usePrevious, useSize } from "@diceui/shared";
import * as React from "react";
import type { CheckedState } from "./checkbox-group-root";

interface BubbleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "checked"> {
  checked: CheckedState;
  control: HTMLElement | null;
  bubbles?: boolean;
  indeterminate?: boolean;
}

export function BubbleInput(props: BubbleInputProps) {
  const {
    control,
    checked,
    bubbles = true,
    defaultValue,
    indeterminate,
    ...inputProps
  } = props;
  const ref = React.useRef<HTMLInputElement>(null);
  const prevChecked = usePrevious(checked);
  const prevIndeterminate = usePrevious(indeterminate);
  const controlSize = useSize(control);

  // Handle both value changes and indeterminate state
  React.useEffect(() => {
    const input = ref.current;
    if (!input) return;

    const inputProto = window.HTMLInputElement.prototype;
    const valueDescriptor = Object.getOwnPropertyDescriptor(
      inputProto,
      "value",
    ) as PropertyDescriptor;
    const setValue = valueDescriptor.set;

    if (prevChecked !== checked && setValue) {
      const event = new Event("input", { bubbles });
      setValue.call(input, JSON.stringify(checked));
      input.dispatchEvent(event);
    }

    // Handle indeterminate state changes
    if (prevIndeterminate !== indeterminate) {
      input.indeterminate = Boolean(indeterminate);
      if (bubbles) {
        const event = new Event("change", { bubbles });
        input.dispatchEvent(event);
      }
    }
  }, [prevChecked, checked, bubbles, indeterminate, prevIndeterminate]);

  const defaultValueRef = React.useRef(JSON.stringify(checked));

  return (
    <input
      type="checkbox"
      aria-hidden
      defaultValue={defaultValue ?? defaultValueRef.current}
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
}
