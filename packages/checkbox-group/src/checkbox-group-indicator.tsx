import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";

const INDICATOR_NAME = "CheckboxGroupIndicator";

interface CheckboxGroupIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {
  /** Whether to force render the indicator */
  forceMount?: boolean;
}

const CheckboxGroupIndicator = React.forwardRef<
  HTMLSpanElement,
  CheckboxGroupIndicatorProps
>((props, ref) => {
  const { forceMount, ...indicatorProps } = props;

  return <Primitive.span ref={ref} {...indicatorProps} />;
});

CheckboxGroupIndicator.displayName = INDICATOR_NAME;

const Indicator = CheckboxGroupIndicator;

export { Indicator, CheckboxGroupIndicator, type CheckboxGroupIndicatorProps };
