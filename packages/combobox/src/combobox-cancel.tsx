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
        type="button"
        {...cancelProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(cancelProps.onClick, () => {
          context.onInputValueChange("");
          context.filterStore.search = "";
          requestAnimationFrame(() => {
            context.inputRef.current?.focus();
          });
        })}
        onPointerDown={composeEventHandlers(
          cancelProps.onPointerDown,
          (event) => {
            if (context.disabled) return;

            // prevent implicit pointer capture
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId);
            }

            if (
              event.button === 0 &&
              event.ctrlKey === false &&
              event.pointerType === "mouse"
            ) {
              // prevent cancel from stealing focus from the input
              event.preventDefault();
            }
          },
        )}
      />
    );
  },
);

ComboboxCancel.displayName = CANCEL_NAME;

const Cancel = ComboboxCancel;

export { Cancel, ComboboxCancel };

export type { ComboboxCancelProps };
