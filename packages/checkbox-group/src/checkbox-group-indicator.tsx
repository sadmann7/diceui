import { Presence } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { getDataState, useCheckboxGroupItem } from "./checkbox-group-item";

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
  const { forceMount = false, ...indicatorProps } = props;
  const itemContext = useCheckboxGroupItem(INDICATOR_NAME);

  return (
    <Presence present={forceMount || itemContext.checked}>
      <Primitive.span
        data-state={getDataState(itemContext.checked)}
        data-disabled={itemContext.disabled ? "" : undefined}
        {...indicatorProps}
        ref={ref}
      />
    </Presence>
  );
});

CheckboxGroupIndicator.displayName = INDICATOR_NAME;

const Indicator = CheckboxGroupIndicator;

export { CheckboxGroupIndicator, Indicator };

export type { CheckboxGroupIndicatorProps };
