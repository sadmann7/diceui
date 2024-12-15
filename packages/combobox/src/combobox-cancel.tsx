import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const CANCEL_NAME = "ComboboxCancel";

interface ComboboxCancelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const ComboboxCancel = React.forwardRef<HTMLButtonElement, ComboboxCancelProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(CANCEL_NAME);

    return (
      <Primitive.button
        ref={forwardedRef}
        type="button"
        {...props}
        onClick={composeEventHandlers(props.onClick, () => {
          context.onValueChange("");
          context.inputRef.current?.focus();
        })}
      />
    );
  },
);

ComboboxCancel.displayName = CANCEL_NAME;

export { ComboboxCancel };

export type { ComboboxCancelProps };
