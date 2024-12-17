import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const ARROW_NAME = "ComboboxArrow";

interface ComboboxArrowProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.svg> {
  width?: number;
  height?: number;
}

const ComboboxArrow = React.forwardRef<SVGSVGElement, ComboboxArrowProps>(
  (props, forwardedRef) => {
    const { width = 10, height = 5, ...arrowProps } = props;

    return (
      <Primitive.svg
        ref={forwardedRef}
        width={width}
        height={height}
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        {...arrowProps}
      />
    );
  },
);

ComboboxArrow.displayName = ARROW_NAME;

const Arrow = ComboboxArrow;

export { ComboboxArrow, Arrow };

export type { ComboboxArrowProps };
