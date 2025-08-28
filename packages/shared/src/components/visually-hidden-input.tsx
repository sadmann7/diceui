import * as React from "react";
import { useFormReset, usePrevious, useSize } from "../hooks";
import { visuallyHidden } from "../lib";

type InputValue = string[] | string;

interface VisuallyHiddenInputProps<T = InputValue>
  extends Omit<
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const prevValue = usePrevious(type === "hidden" ? value : checked);
  const controlSize = useSize(control);

  // Bubble value/checked change to parents
  React.useEffect(() => {
    const input = inputRef.current;
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
  }, [prevValue, value, checked, bubbles, isCheckInput]);

  // Trigger on onReset callback when form is reset
  useFormReset({
    form: inputRef.current?.form ?? null,
    defaultValue: isCheckInput ? (checked as T) : value,
    onReset: (resetValue: T) => {
      onReset?.(resetValue);
    },
  });

  const composedStyle = React.useMemo<React.CSSProperties>(() => {
    return {
      ...style,
      ...(controlSize?.width !== undefined && controlSize?.height !== undefined
        ? controlSize
        : {}),
      border: 0,
      clip: "rect(0 0 0 0)",
      clipPath: "inset(50%)",
      height: "1px",
      margin: "-1px",
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      whiteSpace: "nowrap",
      width: "1px",
    };
  }, [style, controlSize]);

  return (
    <input
      type={type}
      {...inputProps}
      ref={inputRef}
      aria-hidden={isCheckInput}
      tabIndex={-1}
      defaultChecked={isCheckInput ? checked : undefined}
      style={composedStyle}
    />
  );
}
