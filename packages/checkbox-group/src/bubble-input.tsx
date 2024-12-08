import { usePrevious, useSize } from "@diceui/shared";
import * as React from "react";

interface BubbleInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: string[];
  control: HTMLElement | null;
  bubbles?: boolean;
}

export function BubbleInput(props: BubbleInputProps) {
  const { control, value, bubbles = true, ...inputProps } = props;
  const ref = React.useRef<HTMLInputElement>(null);
  const prevValue = usePrevious(value);
  const controlSize = useSize(control);

  // Bubble value change to parents (e.g form change event)
  React.useEffect(() => {
    const input = ref.current;
    if (!input) return;
    const inputProto = window.HTMLInputElement.prototype;
    const descriptor = Object.getOwnPropertyDescriptor(
      inputProto,
      "value",
    ) as PropertyDescriptor;
    const setValue = descriptor.set;

    if (prevValue !== value && setValue) {
      const event = new Event("input", { bubbles });
      setValue.call(input, JSON.stringify(value));
      input.dispatchEvent(event);
    }
  }, [prevValue, value, bubbles]);

  return (
    <input
      type="hidden"
      {...inputProps}
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
