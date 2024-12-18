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

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!context.open) {
          context.onOpenChange(true);
        }

        const value = event.target.value;
        context.onInputValueChange(value);
        context.filterStore.search = value;

        context.filterItems();
      },
      [context],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (
          !context.open &&
          (event.key === "ArrowDown" || event.key === "ArrowUp")
        ) {
          event.preventDefault();
          context.onOpenChange(true);
        }
      },
      [context.open, context.onOpenChange],
    );

    return (
      <Primitive.input
        role="combobox"
        autoComplete="off"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        aria-autocomplete="list"
        aria-disabled={context.disabled}
        disabled={context.disabled}
        {...inputProps}
        ref={composedRefs}
        value={context.inputValue}
        onChange={composeEventHandlers(inputProps.onChange, onChange)}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, onKeyDown)}
      />
    );
  },
);

ComboboxInput.displayName = INPUT_NAME;

const Input = ComboboxInput;

export { ComboboxInput, Input };

export type { ComboboxInputProps };
