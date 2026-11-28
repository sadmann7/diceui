import type * as React from "react";

import { visuallyHidden } from "@base-ui/utils/visuallyHidden";
import { Slot as SlotPrimitive } from "radix-ui";

interface VisuallyHiddenProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function VisuallyHidden(props: VisuallyHiddenProps) {
  const { asChild, style, ...visuallyHiddenProps } = props;

  const Comp = asChild ? SlotPrimitive.Slot : "div";

  return (
    <Comp
      {...visuallyHiddenProps}
      style={{
        ...visuallyHidden,
        ...style,
      }}
    />
  );
}

export { VisuallyHidden };
