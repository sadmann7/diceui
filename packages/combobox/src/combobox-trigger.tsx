import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
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
      aria-controls={context.contentId}
      data-state={context.open ? "open" : "closed"}
      disabled={context.disabled}
      tabIndex={context.disabled ? undefined : -1}
      {...triggerProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(triggerProps.onClick, async () => {
        const newOpenState = !context.open;
        await context.onOpenChange(newOpenState);

        if (newOpenState && context.value.length > 0) {
          requestAnimationFrame(() => {
            context.onHighlightMove("selected");
          });
        }
      })}
      onPointerDown={composeEventHandlers(
        triggerProps.onPointerDown,
        (event) => {
          if (context.disabled) return;

          // prevent implicit pointer capture
          const target = event.target as HTMLElement;
          if (target.hasPointerCapture(event.pointerId)) {
            target.releasePointerCapture(event.pointerId);
          }

          if (
            event.button === 0 &&
            event.ctrlKey === false &&
            event.pointerType === "mouse"
          ) {
            // prevent trigger from stealing focus from the input
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
