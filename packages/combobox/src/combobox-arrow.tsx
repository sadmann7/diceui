"use client";

import { useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContentContext } from "./combobox-content";
import { useComboboxContext } from "./combobox-root";

const ARROW_NAME = "ComboboxArrow";

interface ComboboxArrowProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.svg> {
  /**
   * The width of the arrow.
   * @default 10
   */
  width?: number;
  /**
   * The height of the arrow.
   * @default 5
   */
  height?: number;
}

const ComboboxArrow = React.forwardRef<SVGSVGElement, ComboboxArrowProps>(
  (props, forwardedRef) => {
    const { width = 10, height = 5, ...arrowProps } = props;

    const context = useComboboxContext(ARROW_NAME);
    const contentContext = useComboboxContentContext(ARROW_NAME);

    const composedRef = useComposedRefs(forwardedRef, contentContext.arrowRef);

    if (!context.open) return null;

    return (
      <Primitive.svg
        ref={composedRef}
        width={width}
        height={height}
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        style={contentContext.arrowStyles}
        data-side={contentContext.side}
        data-align={contentContext.align}
        data-uncentered={contentContext.arrowUncentered || undefined}
        data-state={context.open ? "open" : "closed"}
        aria-hidden
        {...arrowProps}
      >
        <path d="M0 10 L15 0 L30 10" fill="currentColor" />
      </Primitive.svg>
    );
  },
);

ComboboxArrow.displayName = ARROW_NAME;

const Arrow = ComboboxArrow;

export { Arrow, ComboboxArrow };
export type { ComboboxArrowProps };
