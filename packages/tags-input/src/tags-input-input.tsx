import { composeEventHandlers, composeRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const INPUT_NAME = "TagsInputInput";

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const TagsInputInput = React.forwardRef<HTMLInputElement, TagsInputInputProps>(
  (props, ref) => {
    const { autoFocus, ...inputProps } = props;
    const context = useTagsInput(INPUT_NAME);

    function onTab(event: React.KeyboardEvent<HTMLInputElement>) {
      if (!context.addOnTab) return;
      onCustomKeydown(event);
    }

    function onCustomKeydown(event: React.KeyboardEvent<HTMLInputElement>) {
      if (event.defaultPrevented) return;

      const value = event.currentTarget.value;
      if (!value) return;

      const isAdded = context.onAddValue(value);
      if (isAdded) {
        event.currentTarget.value = "";
        context.setFocusedValue(null);
      }

      event.preventDefault();
    }

    React.useEffect(() => {
      if (autoFocus) {
        requestAnimationFrame(() => context.inputRef.current?.focus());
      }
    }, [autoFocus, context.inputRef]);

    return (
      <Primitive.input
        ref={composeRefs(context.inputRef, ref)}
        id={context.inputId}
        aria-labelledby={context.labelId}
        autoFocus={autoFocus}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        type="text"
        data-invalid={context.isInvalidInput ? "" : undefined}
        disabled={context.disabled}
        onInput={composeEventHandlers(inputProps.onInput, (event) => {
          const target = event.target as HTMLInputElement;
          const delimiter = context.delimiter;

          if (delimiter === target.value.slice(-1)) {
            const value = target.value.slice(0, -1);
            target.value = "";
            if (value) {
              context.onAddValue(value);
              context.setFocusedValue(null);
            }
          }
        })}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, (event) => {
          if (event.key === "Enter") onCustomKeydown(event);
          if (event.key === "Tab") onTab(event);
          context.onInputKeydown(event);
          if (event.key.length === 1) context.setFocusedValue(null);
        })}
        onBlur={composeEventHandlers(inputProps.onBlur, (event) => {
          if (!context.addOnBlur) return;

          const value = event.target.value;
          if (!value) return;

          const isAdded = context.onAddValue(value);
          if (isAdded) event.target.value = "";
        })}
        onPaste={composeEventHandlers(inputProps.onPaste, (event) => {
          if (context.addOnPaste) {
            event.preventDefault();
            const value = event.clipboardData.getData("text");

            context.onAddValue(value);
            context.setFocusedValue(null);
          }
        })}
        {...inputProps}
      />
    );
  },
);

TagsInputInput.displayName = INPUT_NAME;

const Input = TagsInputInput;

export { Input, TagsInputInput, type TagsInputInputProps };
