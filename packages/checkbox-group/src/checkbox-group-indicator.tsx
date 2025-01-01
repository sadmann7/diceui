import { Presence, Primitive } from "@diceui/shared";
import * as React from "react";
import { getDataState, useCheckboxGroupItem } from "./checkbox-group-item";

const INDICATOR_NAME = "CheckboxGroupIndicator";

interface CheckboxGroupIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {
  /** Whether the indicator should always be rendered. */
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
