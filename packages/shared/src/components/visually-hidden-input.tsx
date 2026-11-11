import * as React from "react";

import { useFormReset, usePrevious, useSize } from "../hooks";
import { visuallyHidden } from "../lib";

type InputValue = string[] | string;

interface VisuallyHiddenInputProps<T = InputValue> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "checked" | "onReset"
> {
  value?: T;
  checked?: boolean;
  control: HTMLElement | null;
  bubbles?: boolean;
  onReset?: (value: T) => void;
}

export function VisuallyHiddenInput<T = InputValue>(
  props: VisuallyHiddenInputProps<T>,
) {
  const {
    control,
    value,
    checked,
    bubbles = true,
    type = "hidden",
    onReset,
    style,
    ...inputProps
  } = props;

  const isCheckInput =
    type === "checkbox" || type === "radio" || type === "switch";
  const [input, setInput] = React.useState<HTMLInputElement | null>(null);
  const prevValue = usePrevious(type === "hidden" ? value : checked);
  const controlSize = useSize(control);

  // Bubble value/checked change to parents.
  React.useEffect(() => {
    if (!input) return;
    const inputProto = window.HTMLInputElement.prototype;

    const propertyKey = isCheckInput ? "checked" : "value";
    const eventType = isCheckInput ? "click" : "input";
    const currentValue = isCheckInput ? checked : JSON.stringify(value);

    const descriptor = Object.getOwnPropertyDescriptor(
      inputProto,
      propertyKey,
    ) as PropertyDescriptor;
    const setter = descriptor.set;

    if (prevValue !== currentValue && setter) {
      const event = new Event(eventType, { bubbles });
      setter.call(input, currentValue);
      input.dispatchEvent(event);
    }
  }, [input, prevValue, value, checked, bubbles, isCheckInput]);

  // Trigger on onReset callback when form is reset.
  useFormReset({
    form: input?.form ?? null,
    defaultValue: isCheckInput ? (checked as T) : value,
    onReset: (resetValue: T) => {
      onReset?.(resetValue);
    },
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      ...visuallyHidden,
      ...style,
      ...(controlSize?.width !== undefined && controlSize?.height !== undefined
        ? controlSize
        : {}),
    };
  }, [style, controlSize]);

  return (
    <input
      type={type}
      {...inputProps}
      ref={setInput}
      aria-hidden={isCheckInput}
      tabIndex={-1}
      defaultChecked={isCheckInput ? checked : undefined}
      style={composedStyle}
    />
  );
}
