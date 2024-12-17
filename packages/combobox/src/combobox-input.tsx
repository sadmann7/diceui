import { composeEventHandlers, useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const INPUT_NAME = "ComboboxInput";

interface ComboboxInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  (props, forwardedRef) => {
    const { ...inputProps } = props;
    const context = useComboboxContext(INPUT_NAME);
    const composedRefs = useComposedRefs(forwardedRef, context.inputRef);

    return (
      <Primitive.input
        ref={composedRefs}
        role="combobox"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        aria-disabled={context.disabled}
        disabled={context.disabled}
        value={context.value}
        onChange={composeEventHandlers(inputProps.onChange, (e) => {
          context.onValueChange(e.target.value);
          if (!context.open) context.onOpenChange(true);
        })}
        {...inputProps}
      />
    );
  },
);

ComboboxInput.displayName = INPUT_NAME;

const Input = ComboboxInput;

export { ComboboxInput, Input };

export type { ComboboxInputProps };
