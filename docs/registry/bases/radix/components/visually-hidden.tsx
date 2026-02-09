import { Slot } from "@radix-ui/react-slot";
import type * as React from "react";

interface VisuallyHiddenProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function VisuallyHidden(props: VisuallyHiddenProps) {
  const { asChild, style, ...visuallyHiddenProps } = props;

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      {...visuallyHiddenProps}
      style={{
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
        ...style,
      }}
    />
  );
}

export { VisuallyHidden };
