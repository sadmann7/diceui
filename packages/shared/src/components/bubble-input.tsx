import * as React from "react";
import { useFormReset, usePrevious, useSize } from "../hooks";

type InputValue = string[] | string;

interface BubbleInputProps<T = InputValue>
  extends Omit<
    React.ComponentPropsWithoutRef<"input">,
    "value" | "checked" | "onReset"
  > {
  value?: T;
  checked?: boolean;
  control: HTMLElement | null;
  bubbles?: boolean;
  onReset?: (value: T) => void;
}

export function BubbleInput<T = InputValue>(props: BubbleInputProps<T>) {
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
  const previousValue = usePrevious(type === "hidden" ? value : checked);
  const controlSize = isCheckInput ? useSize(control) : undefined;

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

    if (previousValue !== currentValue && setter) {
      const event = new Event(eventType, { bubbles });
      setter.call(input, currentValue);
      input.dispatchEvent(event);
    }
  }, [previousValue, value, checked, bubbles, isCheckInput]);

  // Trigger on onReset callback when form is reset
  useFormReset({
    form: inputRef.current?.form ?? null,
    defaultValue: isCheckInput ? (checked as T) : value,
    onReset: (resetValue: T) => {
      onReset?.(resetValue);
    },
  });

  return (
    <input
      type={type}
      {...inputProps}
      ref={inputRef}
      aria-hidden={isCheckInput}
      tabIndex={isCheckInput ? -1 : undefined}
      defaultChecked={isCheckInput ? checked : undefined}
      style={{
        ...style,
        ...controlSize,
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
      }}
    />
  );
}
