import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxItemContext } from "./combobox-item";

const ITEM_INDICATOR_NAME = "ComboboxItemIndicator";

interface ComboboxItemIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {
  /**
   * Whether to render the indicator even if the item is not selected.
   * @default false
   */
  forceMount?: boolean;
}

const ComboboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemIndicatorProps
>((props, forwardedRef) => {
  const { forceMount = false, ...indicatorProps } = props;
  const itemContext = useComboboxItemContext(ITEM_INDICATOR_NAME);

  if (!forceMount && !itemContext.isSelected) return null;

  return (
    <Primitive.span aria-hidden="true" {...indicatorProps} ref={forwardedRef} />
  );
});

ComboboxItemIndicator.displayName = ITEM_INDICATOR_NAME;

const ItemIndicator = ComboboxItemIndicator;

export { ComboboxItemIndicator, ItemIndicator };

export type { ComboboxItemIndicatorProps };
