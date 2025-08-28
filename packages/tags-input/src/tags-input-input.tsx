import { composeEventHandlers, composeRefs, Primitive } from "@diceui/shared";
import * as React from "react";
import { useTagsInput } from "./tags-input-root";

const INPUT_NAME = "TagsInputInput";

interface TagsInputInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const TagsInputInput = React.forwardRef<HTMLInputElement, TagsInputInputProps>(
  (props, ref) => {
    const { autoFocus, ...inputProps } = props;
    const context = useTagsInput(INPUT_NAME);

    const onCustomKeydown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.defaultPrevented) return;

        const value = event.currentTarget.value;
        if (!value) return;

        const isAdded = context.onItemAdd(value);
        if (isAdded) {
          event.currentTarget.value = "";
          context.setHighlightedIndex(null);
        }

        event.preventDefault();
      },
      [context.onItemAdd, context.setHighlightedIndex],
    );

    const onTab = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!context.addOnTab) return;
        onCustomKeydown(event);
      },
      [context.addOnTab, onCustomKeydown],
    );

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
        aria-readonly={context.readOnly}
        data-invalid={context.isInvalidInput ? "" : undefined}
        dir={context.dir}
        disabled={context.disabled}
        readOnly={context.readOnly}
        {...inputProps}
        ref={composeRefs(context.inputRef, ref)}
        onBlur={composeEventHandlers(inputProps.onBlur, (event) => {
          if (context.readOnly) return;

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
          if (context.readOnly) return;

          const target = event.target;
          if (!(target instanceof HTMLInputElement)) return;

          const delimiter = context.delimiter;

          if (delimiter === target.value.slice(-1)) {
            const value = target.value.slice(0, -1);
            target.value = "";
            if (value) {
              context.onItemAdd(value);
              context.setHighlightedIndex(null);
            }
          }
        })}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, (event) => {
          if (context.readOnly) return;

          if (event.key === "Enter") onCustomKeydown(event);
          if (event.key === "Tab") onTab(event);
          context.onInputKeydown(event);
          if (event.key.length === 1) context.setHighlightedIndex(null);
        })}
        onPaste={composeEventHandlers(inputProps.onPaste, (event) => {
          if (context.readOnly) return;

          if (context.addOnPaste) {
            event.preventDefault();
            const value = event.clipboardData.getData("text");

            context.onItemAdd(value, { viaPaste: true });
            context.setHighlightedIndex(null);
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
