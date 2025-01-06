import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

interface MentionInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const MentionInput = React.forwardRef<HTMLInputElement, MentionInputProps>(
  (props, forwardedRef) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs<HTMLInputElement>(
      forwardedRef,
      context.inputRef,
    );

    const getTextWidth = React.useCallback(
      (text: string, input: HTMLInputElement) => {
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

    const getLineHeight = React.useCallback((input: HTMLInputElement) => {
      const style = window.getComputedStyle(input);
      return Number.parseInt(style.lineHeight) || input.offsetHeight;
    }, []);

    const calculatePosition = React.useCallback(
      (input: HTMLInputElement, cursorPosition: number) => {
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

        // Calculate the current line number
        const textBeforeCursor = input.value.slice(0, cursorPosition);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;

        // Get scroll positions
        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

        // Calculate coordinates relative to viewport, ensuring smooth transitions
        const x = Math.min(
          rect.left + paddingLeft + textWidth - scrollLeft,
          rect.right - 10,
        );
        const y =
          rect.top + paddingTop + (currentLine * lineHeight - scrollTop);

        // Create a stable position object
        const position: DOMRect = {
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
        };

        return position;
      },
      [getTextWidth, getLineHeight],
    );

    const createVirtualElement = React.useCallback(
      (element: HTMLInputElement, cursorPosition: number) => {
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

    const onCheckAndOpenMenu = React.useCallback(
      (element: HTMLInputElement) => {
        if (context.disabled || context.readonly) return;

        const { value, selectionStart } = element;
        if (selectionStart === null) return;

        const lastTriggerIndex = value.lastIndexOf(
          context.trigger,
          selectionStart,
        );

        // Check if cursor is immediately after a trigger character
        if (lastTriggerIndex !== -1) {
          const textAfterTrigger = value.slice(
            lastTriggerIndex + 1,
            selectionStart,
          );
          // Only open if there are no spaces in the mention text and cursor is after trigger
          if (
            !textAfterTrigger.includes(" ") &&
            selectionStart > lastTriggerIndex
          ) {
            createVirtualElement(element, lastTriggerIndex);
            context.onOpenChange(true);
            context.filterStore.search = textAfterTrigger;
            context.onFilterItems();
          } else if (selectionStart === lastTriggerIndex + 1) {
            // Open menu when cursor is right after trigger
            createVirtualElement(element, lastTriggerIndex);
            context.onOpenChange(true);
            context.filterStore.search = "";
            context.onFilterItems();
          } else {
            // Close menu when cursor moves away
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.filterStore.search = "";
          }
        }
      },
      [
        context.trigger,
        context.onOpenChange,
        context.filterStore,
        context.onFilterItems,
        context.disabled,
        context.readonly,
        context.onHighlightedItemChange,
        createVirtualElement,
      ],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (context.disabled || context.readonly) return;

        const value = event.target.value;
        const selectionStart = event.target.selectionStart ?? 0;
        const lastTriggerIndex = value.lastIndexOf(
          context.trigger,
          selectionStart,
        );

        if (lastTriggerIndex !== -1) {
          const textAfterTrigger = value.slice(
            lastTriggerIndex + 1,
            selectionStart,
          );

          // Only update position and keep menu open if we're still in a valid mention state
          if (!textAfterTrigger.includes(" ")) {
            createVirtualElement(event.target, lastTriggerIndex);
            context.onOpenChange(true);
            context.filterStore.search = textAfterTrigger;
            context.onFilterItems();
          } else {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.filterStore.search = "";
          }
        } else {
          context.onOpenChange(false);
          context.onHighlightedItemChange(null);
          context.filterStore.search = "";
        }

        context.onInputValueChange?.(value);
      },
      [
        context.trigger,
        context.onOpenChange,
        context.onFilterItems,
        context.filterStore,
        context.disabled,
        context.readonly,
        context.onHighlightedItemChange,
        context.onInputValueChange,
        createVirtualElement,
      ],
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        onCheckAndOpenMenu(event.currentTarget);
      },
      [onCheckAndOpenMenu],
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        onCheckAndOpenMenu(event.currentTarget);
      },
      [onCheckAndOpenMenu],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
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

            // Update cursor position
            input.setSelectionRange(cursorPosition, cursorPosition);
            return;
          }
        }

        // Handle backspace for mention deletion
        if (event.key === "Backspace" && !context.open && !hasSelection) {
          // Find the mention that's immediately before the cursor
          const mention = context.mentions.find((m) => {
            // Check if cursor is right after mention (accounting for space)
            const isCursorAfterMention = cursorPosition === m.end + 1;
            // If there's a space after mention, ensure we're not deleting the space
            if (isCursorAfterMention) {
              const charBeforeCursor = input.value[cursorPosition - 1];
              return charBeforeCursor !== " ";
            }
            return false;
          });

          if (mention) {
            event.preventDefault();

            if (context.tokenized) {
              // In tokenized mode, delete the entire mention
              const newValue =
                input.value.slice(0, mention.start) +
                input.value.slice(mention.end + 1);

              // Update input value directly and through context
              input.value = newValue;
              context.onInputValueChange?.(newValue);
              context.onValueChange?.(
                context.value.filter((v) => v !== mention.value),
              );

              // Update cursor position to start of mention
              const newCursorPosition = mention.start;
              input.setSelectionRange(newCursorPosition, newCursorPosition);
            } else {
              // In text mode, delete character by character
              const newValue =
                input.value.slice(0, cursorPosition - 1) +
                input.value.slice(cursorPosition);

              // Only remove mention from context if we're deleting the trigger character
              if (cursorPosition - 1 === mention.start) {
                context.onValueChange?.(
                  context.value.filter((v) => v !== mention.value),
                );
              }

              // Update input value directly and through context
              input.value = newValue;
              context.onInputValueChange?.(newValue);

              // Update cursor position
              const newCursorPosition = cursorPosition - 1;
              input.setSelectionRange(newCursorPosition, newCursorPosition);
            }
            return;
          }
        }

        // Handle Ctrl/Cmd + Backspace for word deletion
        if (
          event.key === "Backspace" &&
          (event.ctrlKey || event.metaKey) &&
          !hasSelection &&
          !context.tokenized // Only in text mode
        ) {
          const mention = context.mentions.find((m) => {
            // Find mention that contains the cursor or is immediately after it
            return (
              (cursorPosition > m.start && cursorPosition <= m.end) ||
              cursorPosition === m.end + 1
            );
          });

          if (mention) {
            event.preventDefault();
            // Delete up to the trigger character
            const newValue =
              input.value.slice(0, mention.start) +
              input.value.slice(cursorPosition);

            // Update input value directly and through context
            input.value = newValue;
            context.onInputValueChange?.(newValue);
            context.onValueChange?.(
              context.value.filter((v) => v !== mention.value),
            );

            // Update cursor position
            const newCursorPosition = mention.start;
            input.setSelectionRange(newCursorPosition, newCursorPosition);
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
      onCheckAndOpenMenu(input);
    }, [
      context.disabled,
      context.readonly,
      context.inputRef,
      onCheckAndOpenMenu,
    ]);

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
        onSelect={composeEventHandlers(props.onSelect, onSelect)}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { Input, MentionInput };

export type { MentionInputProps };
