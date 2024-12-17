import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const ITEM_INDICATOR_NAME = "ComboboxItemIndicator";

interface ComboboxItemIndicatorProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const ComboboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemIndicatorProps
>((props, forwardedRef) => {
  const { ...indicatorProps } = props;
  const context = useComboboxContext(ITEM_INDICATOR_NAME);

  if (!context.selectedValue) return null;

  return <Primitive.span ref={forwardedRef} {...indicatorProps} />;
});

ComboboxItemIndicator.displayName = ITEM_INDICATOR_NAME;

const ItemIndicator = ComboboxItemIndicator;

export { ComboboxItemIndicator, ItemIndicator };

export type { ComboboxItemIndicatorProps };
