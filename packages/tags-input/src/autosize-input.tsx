import { Primitive } from "@radix-ui/react-primitive";

import * as React from "react";
import { VisuallyHidden } from "./visually-hidden";

interface AutosizeInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  minWidth?: number;
}

export function AutosizeInput({
  value,
  minWidth = 20,
  ...props
}: AutosizeInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const measureRef = React.useRef<HTMLSpanElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  React.useLayoutEffect(() => {
    if (measureRef.current && inputRef.current) {
      const width = Math.max(measureRef.current.offsetWidth, minWidth);
      inputRef.current.style.width = `${width + 4}px`;
    }
  }, [value, minWidth]);

  return (
    <>
      <VisuallyHidden ref={measureRef}>{value}</VisuallyHidden>
      <Primitive.input ref={inputRef} value={value} {...props} />
    </>
  );
}
