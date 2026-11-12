import {
  composeEventHandlers,
  Primitive,
  setFilterSearch,
} from "@diceui/shared";
import * as React from "react";

import { useComboboxContext } from "./combobox-root";

const CANCEL_NAME = "ComboboxCancel";

interface ComboboxCancelProps extends React.ComponentPropsWithoutRef<
  typeof Primitive.button
> {
  /**
   * Whether the cancel button should render even when the input is empty.
   * @default false
   */
  forceMount?: boolean;
}

const ComboboxCancel = React.forwardRef<HTMLButtonElement, ComboboxCancelProps>(
  (props, forwardedRef) => {
    const { forceMount = false, disabled, ...cancelProps } = props;

    const context = useComboboxContext(CANCEL_NAME);

    const isDisabled = disabled || context.disabled;

    if (!forceMount && !context.inputValue) return null;

    return (
      <Primitive.button
        type="button"
        aria-controls={context.inputId}
        data-disabled={isDisabled ? "" : undefined}
        disabled={isDisabled}
        {...cancelProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(cancelProps.onClick, () => {
          context.onInputValueChange("");
          setFilterSearch(context.filterStore, "");
          requestAnimationFrame(() => {
            context.inputRef.current?.focus();
          });
        })}
        onPointerDown={composeEventHandlers(
          cancelProps.onPointerDown,
          (event) => {
            if (isDisabled) return;

            // Prevents implicit pointer capture.
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (target.hasPointerCapture(event.pointerId)) {
              target.releasePointerCapture(event.pointerId);
            }

            if (
              event.button === 0 &&
              !event.ctrlKey &&
              event.pointerType === "mouse"
            ) {
              // Keeps the cancel button from stealing focus from the input.
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

export type { ComboboxCancelProps };
export { Cancel, ComboboxCancel };
