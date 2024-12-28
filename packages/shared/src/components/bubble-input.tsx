import * as React from "react";
import { useFormReset, usePrevious, useSize } from "../hooks";

type InputValue = string[] | string;

interface BubbleInputProps<T = InputValue>
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

export function BubbleInput<T = InputValue>(props: BubbleInputProps<T>) {
  const {
    control,
    value,
    checked,
    bubbles = true,
    type = "hidden",
    onReset,
    ...inputProps
  } = props;

  const ref = React.useRef<HTMLInputElement>(null);
  const prevValue = usePrevious(type === "hidden" ? value : checked);
  const controlSize = useSize(control);
  const isCheckInput =
    type === "checkbox" || type === "radio" || type === "switch";

  // Bubble value/checked change to parents
  React.useEffect(() => {
    const input = ref.current;
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
    form: ref.current?.form ?? null,
    defaultValue: isCheckInput ? (checked as T) : value,
    onReset: (resetValue: T) => {
      onReset?.(resetValue);
    },
  });

  return (
    <input
      type={type}
      {...inputProps}
      ref={ref}
      aria-hidden={isCheckInput}
      tabIndex={isCheckInput ? -1 : undefined}
      defaultChecked={isCheckInput ? checked : undefined}
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
