import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

interface VisuallyHiddenProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const VisuallyHidden = React.forwardRef<HTMLDivElement, VisuallyHiddenProps>(
  ({ asChild, style, ...props }, forwardedRef) => {
    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        {...props}
        ref={forwardedRef}
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
  },
);

VisuallyHidden.displayName = "VisuallyHidden";

export { VisuallyHidden };
