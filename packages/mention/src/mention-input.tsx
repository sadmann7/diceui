import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

type InputElement = React.ElementRef<typeof Primitive.input>;

interface MentionInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const MentionInput = React.forwardRef<InputElement, MentionInputProps>(
  (props, forwardedRef) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs(forwardedRef, context.inputRef);

    const getTextWidth = React.useCallback(
      (text: string, input: InputElement) => {
        const style = window.getComputedStyle(input);
        const measureSpan = document.createElement("span");
        measureSpan.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre;
        font: ${style.font};
        letter-spacing: ${style.letterSpacing};
        text-transform: ${style.textTransform};
      `;
        measureSpan.textContent = text;
        document.body.appendChild(measureSpan);
        const width = measureSpan.offsetWidth;
        document.body.removeChild(measureSpan);
        return width;
      },
      [],
    );

    const getLineHeight = React.useCallback((input: InputElement) => {
      const style = window.getComputedStyle(input);
      return Number.parseInt(style.lineHeight) || input.offsetHeight;
    }, []);

    const calculatePosition = React.useCallback(
      (input: InputElement, cursorPosition: number) => {
        const rect = input.getBoundingClientRect();
        const text = input.value.slice(0, cursorPosition);
        const textWidth = getTextWidth(text, input);
        const lineHeight = getLineHeight(input);
        const paddingLeft = Number.parseFloat(
          getComputedStyle(input).paddingLeft,
        );
        const paddingTop = Number.parseFloat(
          getComputedStyle(input).paddingTop,
        );

        const textBeforeCursor = input.value.slice(0, cursorPosition);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;

        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

        const x = Math.min(
          rect.left + paddingLeft + textWidth - scrollLeft,
          rect.right - 10,
        );
        const y =
          rect.top + paddingTop + (currentLine * lineHeight - scrollTop);

        return {
          width: 0,
          height: lineHeight,
          x,
          y,
          top: y,
          right: x,
          bottom: y + lineHeight,
          left: x,
          toJSON() {
            return this;
          },
        } as DOMRect;
      },
      [getTextWidth, getLineHeight],
    );

    const createVirtualElement = React.useCallback(
      (element: InputElement, cursorPosition: number) => {
        const virtualElement = {
          getBoundingClientRect() {
            return calculatePosition(element, cursorPosition);
          },
          getClientRects() {
            const rect = this.getBoundingClientRect();
            const rects = [rect];
            Object.defineProperty(rects, "item", {
              value: function (index: number) {
                return this[index];
              },
            });
            return rects;
          },
        };

        context.onVirtualAnchorChange(virtualElement);
      },
      [context.onVirtualAnchorChange, calculatePosition],
    );

    const onMentionUpdate = React.useCallback(
      (element: InputElement, selectionStart: number | null = null) => {
        if (context.disabled || context.readonly) return false;

        const currentPosition = selectionStart ?? element.selectionStart;
        if (currentPosition === null) return false;

        const value = element.value;
        const lastTriggerIndex = value.lastIndexOf(
          context.trigger,
          currentPosition,
        );

        if (lastTriggerIndex === -1) {
          if (context.open) {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.filterStore.search = "";
          }
          return false;
        }

        const textAfterTrigger = value.slice(
          lastTriggerIndex + 1,
          currentPosition,
        );
        const isValidMention = !textAfterTrigger.includes(" ");
        const isCursorAfterTrigger = currentPosition > lastTriggerIndex;
        const isImmediatelyAfterTrigger =
          currentPosition === lastTriggerIndex + 1;

        if (
          isValidMention &&
          (isCursorAfterTrigger || isImmediatelyAfterTrigger)
        ) {
          createVirtualElement(element, lastTriggerIndex);
          context.onOpenChange(true);
          context.filterStore.search = isImmediatelyAfterTrigger
            ? ""
            : textAfterTrigger;
          context.onItemsFilter();
          return true;
        }

        if (context.open) {
          context.onOpenChange(false);
          context.onHighlightedItemChange(null);
          context.filterStore.search = "";
        }
        return false;
      },
      [
        context.trigger,
        context.open,
        context.onOpenChange,
        context.filterStore,
        context.onItemsFilter,
        context.disabled,
        context.readonly,
        context.onHighlightedItemChange,
        createVirtualElement,
      ],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;
        context.onInputValueChange?.(event.target.value);
        onMentionUpdate(event.target);
      },
      [
        context.disabled,
        context.readonly,
        context.onInputValueChange,
        onMentionUpdate,
      ],
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<InputElement>) => {
        onMentionUpdate(event.currentTarget);
      },
      [onMentionUpdate],
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<InputElement>) => {
        onMentionUpdate(event.currentTarget);
      },
      [onMentionUpdate],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<InputElement>) => {
        const input = event.currentTarget;
        const cursorPosition = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? cursorPosition;
        const hasSelection = cursorPosition !== selectionEnd;

        // Handle text clearing with selection
        if (
          (event.key === "Backspace" || event.key === "Delete") &&
          hasSelection
        ) {
          const newValue =
            input.value.slice(0, cursorPosition) +
            input.value.slice(selectionEnd);

          // Find mentions that are fully or partially within the selection
          const affectedMentions = context.mentions.filter(
            (m) =>
              (m.start >= cursorPosition && m.start < selectionEnd) ||
              (m.end > cursorPosition && m.end <= selectionEnd),
          );

          if (affectedMentions.length > 0) {
            event.preventDefault();

            // Update input value directly and through context
            input.value = newValue;
            context.onInputValueChange?.(newValue);

            // Remove affected mentions from context value
            const remainingValues = context.value.filter(
              (v) => !affectedMentions.some((m) => m.value === v),
            );
            context.onValueChange?.(remainingValues);
            context.onMentionsRemove(affectedMentions);

            // Update cursor position
            input.setSelectionRange(cursorPosition, cursorPosition);
            return;
          }
        }

        // Handle backspace for mention deletion
        if (event.key === "Backspace" && !context.open && !hasSelection) {
          // Find the mention that's immediately before the cursor
          const mentionBeforeCursor = context.mentions.find((m) => {
            // Check if cursor is right after mention (accounting for space)
            const isCursorAfterMention =
              cursorPosition === m.end || // Cursor exactly at end
              (cursorPosition === m.end + 1 && input.value[m.end] === " "); // Or after space
            return isCursorAfterMention;
          });

          if (mentionBeforeCursor) {
            const hasTrailingSpace =
              input.value[mentionBeforeCursor.end] === " ";
            const isCtrlOrCmd = event.metaKey || event.ctrlKey;

            // If there's a trailing space and not using Ctrl/Cmd, just remove the space
            if (
              hasTrailingSpace &&
              cursorPosition === mentionBeforeCursor.end + 1 &&
              !isCtrlOrCmd
            ) {
              event.preventDefault();
              const newValue =
                input.value.slice(0, mentionBeforeCursor.end) +
                input.value.slice(mentionBeforeCursor.end + 1);

              input.value = newValue;
              context.onInputValueChange?.(newValue);
              input.setSelectionRange(
                mentionBeforeCursor.end,
                mentionBeforeCursor.end,
              );
              return;
            }

            // Otherwise remove the entire mention
            event.preventDefault();
            const newValue =
              input.value.slice(0, mentionBeforeCursor.start) +
              input.value.slice(
                mentionBeforeCursor.end + (hasTrailingSpace ? 1 : 0),
              );

            input.value = newValue;
            context.onInputValueChange?.(newValue);

            const remainingValues = context.value.filter(
              (v) => v !== mentionBeforeCursor.value,
            );
            context.onValueChange?.(remainingValues);
            context.onMentionsRemove([mentionBeforeCursor]);

            const newPosition = mentionBeforeCursor.start;
            input.setSelectionRange(newPosition, newPosition);
            return;
          }
        }

        if (!context.open) return;

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Enter",
          "Escape",
          "Tab",
        ].includes(event.key);

        if (isNavigationKey && event.key !== "Tab") {
          event.preventDefault();
        }

        function onMenuClose() {
          context.onOpenChange(false);
          context.onHighlightedItemChange(null);
          context.filterStore.search = "";
        }

        function onItemSelect() {
          if (context.disabled || context.readonly || !context.highlightedItem)
            return;
          const value = context.highlightedItem.value;
          if (!value) return;

          const lastTriggerIndex = input.value.lastIndexOf(
            context.trigger,
            cursorPosition,
          );

          if (lastTriggerIndex !== -1) {
            context.onMentionAdd(value, lastTriggerIndex);
          }
        }

        switch (event.key) {
          case "Enter": {
            if (!context.highlightedItem) {
              onMenuClose();
              return;
            }
            event.preventDefault();
            onItemSelect();
            break;
          }
          case "Tab": {
            if (context.modal) {
              event.preventDefault();
              return;
            }
            if (context.highlightedItem) {
              onItemSelect();
            }
            onMenuClose();
            break;
          }
          case "ArrowDown": {
            if (context.readonly) return;
            context.onHighlightMove(context.highlightedItem ? "next" : "first");
            break;
          }
          case "ArrowUp": {
            if (context.readonly) return;
            context.onHighlightMove(context.highlightedItem ? "prev" : "last");
            break;
          }
          case "Escape": {
            onMenuClose();
            break;
          }
        }
      },
      [context],
    );

    const onSelect = React.useCallback(() => {
      if (context.disabled || context.readonly) return;
      const input = context.inputRef.current;
      if (!input) return;
      onMentionUpdate(input);
    }, [context.disabled, context.readonly, context.inputRef, onMentionUpdate]);

    const onPaste = React.useCallback(
      (event: React.ClipboardEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;

        const input = event.currentTarget;
        const pastedText = event.clipboardData.getData("text");
        const cursorPosition = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? cursorPosition;

        // Check if pasted text contains trigger
        const triggerIndex = pastedText.indexOf(context.trigger);
        if (triggerIndex === -1) return; // No trigger found, allow default paste

        event.preventDefault();

        // Split text by trigger and process each mention
        const parts = pastedText.split(context.trigger);
        let newText = "";
        let currentPosition = cursorPosition;

        // Handle first part (before any triggers)
        if (parts[0]) {
          newText += parts[0];
          currentPosition += parts[0].length;
        }

        // Process remaining parts that come after triggers
        for (let i = 1; i < parts.length; i++) {
          const part = parts[i];
          if (!part) continue;

          const spaceIndex = part.indexOf(" ");
          const mentionText =
            spaceIndex === -1 ? part : part.slice(0, spaceIndex);
          const remainingText = spaceIndex === -1 ? "" : part.slice(spaceIndex);

          // Only process if there's mention text
          if (mentionText) {
            // Calculate the position where this mention starts
            const mentionStartPosition = cursorPosition + newText.length;

            // Add the text to the new content
            const textToAdd = context.trigger + mentionText + remainingText;
            newText += textToAdd;
            currentPosition += textToAdd.length;

            // Update input value
            const newValue =
              input.value.slice(0, cursorPosition) +
              newText +
              input.value.slice(selectionEnd);

            input.value = newValue;
            context.onInputValueChange?.(newValue);

            // Trigger mention update to check if it's valid
            context.filterStore.search = mentionText;
            context.onItemsFilter();

            // Only add mention if it exists in the available items
            const isValidMention = context.getIsItemVisible(mentionText);
            if (isValidMention) {
              context.onMentionAdd(mentionText, mentionStartPosition);
            }

            input.setSelectionRange(currentPosition, currentPosition);
          }
        }
      },
      [context],
    );

    return (
      <Primitive.input
        role="combobox"
        id={context.inputId}
        autoComplete="off"
        aria-expanded={context.open}
        aria-controls={context.listId}
        aria-labelledby={context.labelId}
        aria-autocomplete="list"
        aria-activedescendant={context.highlightedItem?.ref.current?.id}
        aria-disabled={context.disabled}
        aria-readonly={context.readonly}
        disabled={context.disabled}
        readOnly={context.readonly}
        {...props}
        ref={composedRef}
        onChange={composeEventHandlers(props.onChange, onChange)}
        onClick={composeEventHandlers(props.onClick, onClick)}
        onFocus={composeEventHandlers(props.onFocus, onFocus)}
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
        onPaste={composeEventHandlers(props.onPaste, onPaste)}
        onSelect={composeEventHandlers(props.onSelect, onSelect)}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { MentionInput, Input };

export type { MentionInputProps, InputElement };
