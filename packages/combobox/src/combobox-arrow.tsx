"use client";

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

    if (!context.open) return null;

    return (
      <span
        ref={contentContext.arrowRef}
        style={{
          visibility: contentContext.arrowDisplaced ? "hidden" : undefined,
          ...contentContext.arrowStyles,
        }}
      >
        <Primitive.svg
          width={width}
          height={height}
          viewBox="0 0 30 10"
          preserveAspectRatio="none"
          aria-hidden={contentContext.arrowDisplaced}
          data-side={contentContext.side}
          data-align={contentContext.align}
          data-displaced={contentContext.arrowDisplaced || undefined}
          data-state={context.open ? "open" : "closed"}
          {...arrowProps}
          ref={forwardedRef}
          style={{
            ...arrowProps.style,
            display: "block",
          }}
        >
          <path d="M0 10 L15 0 L30 10" fill="currentColor" />
        </Primitive.svg>
      </span>
    );
  },
);

ComboboxArrow.displayName = ARROW_NAME;

const Arrow = ComboboxArrow;

export { Arrow, ComboboxArrow };
export type { ComboboxArrowProps };
