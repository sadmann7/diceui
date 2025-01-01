import {
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
    const {
      onInputValueChange,
      onOpen,
      onClose,
      setTriggerPoint,
      open,
      triggerRef,
    } = useMentionContext(INPUT_NAME);

    const composedRef = useComposedRefs<HTMLInputElement>(ref, triggerRef);

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

          setTriggerPoint({
            top: rect.top + currentLine * lineHeight,
            left: rect.left + (selectionStart ?? 0) * 8, // Approximate char width
          });
          onOpen();
        }

        onInputValueChange(value);
      },
      [onInputValueChange, onOpen, setTriggerPoint, triggerChar],
    );

    const onKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape" && open) {
          onClose();
        }
      },
      [onClose, open],
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
