import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxItemContext } from "./combobox-item";

const ITEM_INDICATOR_NAME = "ComboboxItemIndicator";

interface ComboboxItemIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const ComboboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemIndicatorProps
>((props, forwardedRef) => {
  const { ...indicatorProps } = props;
  const itemContext = useComboboxItemContext(ITEM_INDICATOR_NAME);

  if (!itemContext.isSelected) return null;

  return (
    <Primitive.span aria-hidden="true" {...indicatorProps} ref={forwardedRef} />
  );
});

ComboboxItemIndicator.displayName = ITEM_INDICATOR_NAME;

const ItemIndicator = ComboboxItemIndicator;

export { ComboboxItemIndicator, ItemIndicator };

export type { ComboboxItemIndicatorProps };
