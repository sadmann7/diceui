import { Primitive } from "@diceui/shared";
import * as React from "react";
import { useComboboxItemContext } from "./combobox-item";

const ITEM_TEXT_NAME = "ComboboxItemText";

interface ComboboxItemTextProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.span> {}

const ComboboxItemText = React.forwardRef<
  HTMLSpanElement,
  ComboboxItemTextProps
>((props, forwardedRef) => {
  const itemContext = useComboboxItemContext(ITEM_TEXT_NAME);

  return (
    <Primitive.span id={itemContext.textId} {...props} ref={forwardedRef} />
  );
});

ComboboxItemText.displayName = ITEM_TEXT_NAME;

const ItemText = ComboboxItemText;

export { ComboboxItemText, ItemText };

export type { ComboboxItemTextProps };
