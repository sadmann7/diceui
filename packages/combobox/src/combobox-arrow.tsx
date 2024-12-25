import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContentContext } from "./combobox-content";
import { getDataState, useComboboxContext } from "./combobox-root";

const ARROW_NAME = "ComboboxArrow";

interface ComboboxArrowProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.svg> {
  /**
   * The width of the arrow in pixels.
   * @default 10
   */
  width?: number;

  /**
   * The height of the arrow in pixels.
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
        ref={(node) => contentContext.onArrowChange(node)}
        style={{
          ...contentContext.arrowStyles,
          visibility: contentContext.arrowDisplaced ? "hidden" : undefined,
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
          data-displaced={contentContext.arrowDisplaced ? "" : undefined}
          data-state={getDataState(context.open)}
          {...arrowProps}
          ref={forwardedRef}
          style={{
            ...arrowProps.style,
            // ensure the svg is measured correctly
            display: "block",
          }}
        >
          {props.asChild ? (
            props.children
          ) : (
            <path d="M0 10 L15 0 L30 10" fill="currentColor" />
          )}
        </Primitive.svg>
      </span>
    );
  },
);

ComboboxArrow.displayName = ARROW_NAME;

const Arrow = ComboboxArrow;

export { Arrow, ComboboxArrow };
export type { ComboboxArrowProps };
