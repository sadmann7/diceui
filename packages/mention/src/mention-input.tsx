import {
  DATA_VALUE_ATTR,
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

interface MentionInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  triggerChar?: string;
}

const MentionInput = React.forwardRef<HTMLInputElement, MentionInputProps>(
  ({ triggerChar = "@", ...props }, ref) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs<HTMLInputElement>(
      ref,
      context.triggerRef,
    );

    const onChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const lastChar = value[value.length - 1];

        if (lastChar === triggerChar) {
          const { selectionStart } = e.target;
          const rect = e.target.getBoundingClientRect();
          const lineHeight = Number.parseInt(
            getComputedStyle(e.target).lineHeight,
          );
          const lines = value.substr(0, selectionStart ?? 0).split("\n");
          const currentLine = lines.length;

          context.onTriggerPointChange({
            top: rect.top + currentLine * lineHeight,
            left: rect.left + (selectionStart ?? 0) * 8, // Approximate char width
          });
          context.onOpenChange(true);
        }

        context.onInputValueChange(value);
        if (context.open) {
          context.onFilterItems();
        }
      },
      [
        context.onInputValueChange,
        context.onOpenChange,
        context.onTriggerPointChange,
        context.open,
        context.onFilterItems,
        triggerChar,
      ],
    );

    const onKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!context.open) return;

        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            context.onHighlightMove("next");
            break;
          case "ArrowUp":
            e.preventDefault();
            context.onHighlightMove("prev");
            break;
          case "Home":
            if (e.ctrlKey) {
              e.preventDefault();
              context.onHighlightMove("first");
            }
            break;
          case "End":
            if (e.ctrlKey) {
              e.preventDefault();
              context.onHighlightMove("last");
            }
            break;
          case "Enter":
            e.preventDefault();
            if (context.highlightedItem) {
              const value =
                context.highlightedItem.getAttribute(DATA_VALUE_ATTR);
              if (value) {
                context.onItemSelect(value);
              }
            }
            break;
          case "Escape":
            e.preventDefault();
            context.onOpenChange(false);
            break;
          case "Tab":
            e.preventDefault();
            if (e.shiftKey) {
              context.onHighlightMove("prev");
            } else {
              context.onHighlightMove("next");
            }
            break;
        }
      },
      [context],
    );

    return (
      <Primitive.input
        ref={composedRef}
        onChange={composeEventHandlers(props.onChange, onChange)}
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
        {...props}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { MentionInput, Input };

export type { MentionInputProps };
