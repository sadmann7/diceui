import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

export interface MentionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {
  triggerChar?: string;
}

export const MentionTrigger = React.forwardRef<
  HTMLInputElement,
  MentionTriggerProps
>(({ triggerChar = "@", onChange, onKeyDown, ...props }, ref) => {
  const { onInputChange, onOpen, onClose, setTriggerPoint, state, triggerRef } =
    useMentionContext("MentionTrigger");

  const composedRef = useComposedRefs(ref, triggerRef);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    if (lastChar === triggerChar) {
      const { selectionStart } = e.target;
      const rect = e.target.getBoundingClientRect();
      const lineHeight = Number.parseInt(getComputedStyle(e.target).lineHeight);
      const lines = value.substr(0, selectionStart ?? 0).split("\n");
      const currentLine = lines.length;

      setTriggerPoint({
        top: rect.top + currentLine * lineHeight,
        left: rect.left + (selectionStart ?? 0) * 8, // Approximate char width
      });
      onOpen();
    }

    onInputChange(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && state.isOpen) {
      onClose();
    }
  };

  return (
    <Primitive.input
      // @ts-expect-error - TODO: fix this
      ref={composedRef}
      onChange={composeEventHandlers(onChange, handleChange)}
      onKeyDown={composeEventHandlers(onKeyDown, handleKeyDown)}
      {...props}
    />
  );
});

MentionTrigger.displayName = "MentionTrigger";
