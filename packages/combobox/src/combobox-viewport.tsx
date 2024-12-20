import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const VIEWPORT_NAME = "ComboboxViewport";

interface ComboboxViewportProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.div> {}

const ComboboxViewport = React.forwardRef<
  HTMLDivElement,
  ComboboxViewportProps
>((props, forwardedRef) => {
  return (
    <Primitive.div
      ref={forwardedRef}
      data-dice-combobox-viewport=""
      style={{
        position: "relative",
        flex: 1,
        overflow: "auto",
      }}
      {...props}
    />
  );
});

ComboboxViewport.displayName = VIEWPORT_NAME;

const Viewport = ComboboxViewport;

export { ComboboxViewport, Viewport };

export type { ComboboxViewportProps };
