import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const CANCEL_NAME = "ComboboxCancel";

interface ComboboxCancelProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {
  /**
   * Whether the cancel button should always be mounted.
   * @default false
   */
  forceMount?: boolean;
}

const ComboboxCancel = React.forwardRef<HTMLButtonElement, ComboboxCancelProps>(
  (props, forwardedRef) => {
    const { forceMount = false, ...cancelProps } = props;
    const context = useComboboxContext(CANCEL_NAME);

    if (!forceMount && !context.inputValue) return null;

    return (
      <Primitive.button
        ref={forwardedRef}
        type="button"
        {...cancelProps}
        onClick={composeEventHandlers(cancelProps.onClick, () => {
          context.onInputValueChange("");
          requestAnimationFrame(() => {
            context.inputRef.current?.focus();
          });
        })}
      />
    );
  },
);

ComboboxCancel.displayName = CANCEL_NAME;

const Cancel = ComboboxCancel;

export { Cancel, ComboboxCancel };

export type { ComboboxCancelProps };
