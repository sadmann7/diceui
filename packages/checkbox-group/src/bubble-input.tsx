import { usePrevious, useSize } from "@diceui/shared";
import * as React from "react";

interface BubbleInputProps
  extends Omit<React.ComponentPropsWithoutRef<"input">, "checked"> {
  checked: boolean;
  control: HTMLElement | null;
  bubbles: boolean;
}

function BubbleInput(props: BubbleInputProps) {
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
}

export { BubbleInput };
