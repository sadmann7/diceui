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

      const isAdded = context.onItemAdd(value);
      if (isAdded) {
        event.currentTarget.value = "";
        context.setHighlightedValue(null);
      }

      event.preventDefault();
    }

    React.useEffect(() => {
      if (!autoFocus) return;

      const animationFrameId = requestAnimationFrame(() =>
        context.inputRef.current?.focus(),
      );
      return () => cancelAnimationFrame(animationFrameId);
    }, [autoFocus, context.inputRef]);

    return (
      <Primitive.input
        type="text"
        id={context.inputId}
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        autoFocus={autoFocus}
        aria-labelledby={context.labelId}
        data-invalid={context.isInvalidInput ? "" : undefined}
        disabled={context.disabled}
        {...inputProps}
        ref={composeRefs(context.inputRef, ref)}
        onBlur={composeEventHandlers(inputProps.onBlur, (event) => {
          if (context.blurBehavior === "add") {
            const value = event.target.value;
            if (value) {
              const isAdded = context.onItemAdd(value);
              if (isAdded) event.target.value = "";
            }
          }

          if (context.blurBehavior === "clear") {
            event.target.value = "";
          }
        })}
        onChange={composeEventHandlers(inputProps.onChange, (event) => {
          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;

          const delimiter = context.delimiter;

          if (delimiter === target.value.slice(-1)) {
            const value = target.value.slice(0, -1);
            target.value = "";
            if (value) {
              context.onItemAdd(value);
              context.setHighlightedValue(null);
            }
          }
        })}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, (event) => {
          if (event.key === "Enter") onCustomKeydown(event);
          if (event.key === "Tab") onTab(event);
          context.onInputKeydown(event);
          if (event.key.length === 1) context.setHighlightedValue(null);
        })}
        onPaste={composeEventHandlers(inputProps.onPaste, (event) => {
          if (context.addOnPaste) {
            event.preventDefault();
            const value = event.clipboardData.getData("text");

            context.onItemAdd(value, { viaPaste: true });
            context.setHighlightedValue(null);
          }
        })}
      />
    );
  },
);

TagsInputInput.displayName = INPUT_NAME;

const Input = TagsInputInput;

export { TagsInputInput, Input };

export type { TagsInputInputProps };
