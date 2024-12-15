import { composeEventHandlers } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
// combobox-trigger.tsx
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
      {...triggerProps}
      ref={forwardedRef}
      onClick={composeEventHandlers(triggerProps.onClick, () => {
        context.onOpenChange(!context.open);
      })}
    />
  );
});

ComboboxTrigger.displayName = TRIGGER_NAME;

export { ComboboxTrigger };

export type { ComboboxTriggerProps };