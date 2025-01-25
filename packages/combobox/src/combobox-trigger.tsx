import { Primitive, composeEventHandlers } from "@diceui/shared";
import * as React from "react";

import { useComboboxContext } from "./combobox-root";

const TRIGGER_NAME = "ComboboxTrigger";

interface ComboboxTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.button> {}

const ComboboxTrigger = React.forwardRef<
  HTMLButtonElement,
  ComboboxTriggerProps
>((props, forwardedRef) => {
  const { ...triggerProps } = props;
  const context = useComboboxContext(TRIGGER_NAME);

  return (
    <Primitive.button
      type="button"
      aria-haspopup="listbox"
      aria-expanded={context.open}
      aria-controls={context.listId}
      data-state={context.open ? "open" : "closed"}
      dir={context.dir}
      disabled={context.disabled}
      tabIndex={context.disabled ? undefined : -1}
      {...triggerProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(triggerProps.onClick, async () => {
        const newOpenState = !context.open;
        context.onOpenChange(newOpenState);

        await new Promise((resolve) => requestAnimationFrame(resolve));

        const input = context.inputRef.current;
        if (input) {
          input.focus();
          const length = input.value.length;
          input.setSelectionRange(length, length);
        }

        if (!newOpenState) return;

        if (context.value.length > 0) {
          context.onHighlightMove("selected");
        }
      })}
      onPointerDown={composeEventHandlers(
        triggerProps.onPointerDown,
        (event) => {
          if (context.disabled) return;

          // prevent implicit pointer capture
          const target = event.target;
          if (!(target instanceof Element)) return;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
          }

          // Only prevent default if we're not clicking on the input
          // This allows text selection in the input while still preventing focus stealing elsewhere
          if (
            event.button === 0 &&
            event.ctrlKey === false &&
            event.pointerType === "mouse" &&
            !(event.target instanceof HTMLInputElement)
          ) {
            event.preventDefault();
          }
        },
      )}
    />
  );
});

ComboboxTrigger.displayName = TRIGGER_NAME;

const Trigger = ComboboxTrigger;

export { ComboboxTrigger, Trigger };

export type { ComboboxTriggerProps };
