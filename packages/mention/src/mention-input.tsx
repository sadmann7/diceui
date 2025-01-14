import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { MentionHighlighter } from "./mention-highlighter";
import { useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

type InputElement = React.ElementRef<typeof Primitive.input>;

interface MentionInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const MentionInput = React.forwardRef<InputElement, MentionInputProps>(
  (props, forwardedRef) => {
    const { style, ...inputProps } = props;
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
        const textBeforeCursor = input.value.slice(0, cursorPosition);
        const lines = textBeforeCursor.split("\n");
        const currentLine = lines.length - 1;
        const currentLineText = lines[currentLine] ?? "";
        const textWidth = getTextWidth(currentLineText, input);

        const style = window.getComputedStyle(input);
        const lineHeight = getLineHeight(input);
        const paddingLeft = Number.parseFloat(
          style.getPropertyValue("padding-left") ?? "0",
        );
        const paddingTop = Number.parseFloat(
          style.getPropertyValue("padding-top") ?? "0",
        );

        // Calculate wrapped lines before cursor
        const containerWidth = input.clientWidth - paddingLeft * 2;
        const wrappedLines = Math.floor(textWidth / containerWidth);
        const totalLines = currentLine + wrappedLines;

        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

        // Calculate x position considering text wrapping
        const effectiveTextWidth = textWidth % containerWidth;
        const x = Math.min(
          rect.left + paddingLeft + effectiveTextWidth - scrollLeft,
          rect.right - 10,
        );

        // Calculate y position considering wrapped lines
        const y = rect.top + paddingTop + (totalLines * lineHeight - scrollTop);

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
        } satisfies DOMRect;
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

        // Check if trigger is part of continuous text (like username@domain, passwords, etc)
        function getIsTriggerPartOfText() {
          // Look for characters before the trigger
          const textBeforeTrigger = value.slice(0, lastTriggerIndex);
          const hasTextBeforeTrigger = /\S/.test(textBeforeTrigger);

          // If there's no text before trigger, it's a valid mention trigger
          if (!hasTextBeforeTrigger) return false;

          // Check if there's no space or newline before the trigger
          const lastCharBeforeTrigger = textBeforeTrigger.slice(-1);
          return (
            lastCharBeforeTrigger !== " " && lastCharBeforeTrigger !== "\n"
          );
        }

        if (getIsTriggerPartOfText()) {
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
        context.open,
        context.onOpenChange,
        context.trigger,
        createVirtualElement,
        context.filterStore,
        context.onItemsFilter,
        context.onHighlightedItemChange,
        context.disabled,
        context.readonly,
      ],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;
        context.onInputValueChange?.(event.target.value);
        onMentionUpdate(event.target);
      },
      [
        context.onInputValueChange,
        onMentionUpdate,
        context.disabled,
        context.readonly,
      ],
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<InputElement>) => {
        onMentionUpdate(event.currentTarget);
      },
      [onMentionUpdate],
    );

    const onCut = React.useCallback(
      (event: React.ClipboardEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;

        const input = event.currentTarget;
        const cursorPosition = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? cursorPosition;
        const hasSelection = cursorPosition !== selectionEnd;

        if (!hasSelection) return;

        // Find mentions that are fully or partially within the selection
        const affectedMentions = context.mentions.filter(
          (m) =>
            (m.start >= cursorPosition && m.start < selectionEnd) ||
            (m.end > cursorPosition && m.end <= selectionEnd),
        );

        if (affectedMentions.length > 0) {
          // Let the browser handle copying to clipboard
          // After the cut operation, update our state
          requestAnimationFrame(() => {
            // Remove affected mentions from context value
            const remainingValues = context.value.filter(
              (v) => !affectedMentions.some((m) => m.value === v),
            );
            context.onValueChange?.(remainingValues);
            context.onMentionsRemove(affectedMentions);
          });
        }
      },
      [
        context.disabled,
        context.readonly,
        context.mentions,
        context.value,
        context.onValueChange,
        context.onMentionsRemove,
      ],
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

        // Handle cursor navigation around mentions
        if (
          (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
          !hasSelection &&
          !event.shiftKey // Don't override shift + arrow selection
        ) {
          const isCtrlOrCmd = event.metaKey || event.ctrlKey;
          const isLeftArrow = event.key === "ArrowLeft";

          // Find mention that's immediately before or after cursor
          const adjacentMention = context.mentions.find((m) => {
            if (isLeftArrow) {
              // For left arrow, check if cursor is at the end of mention
              return cursorPosition === m.end;
            }
            // For right arrow, check if cursor is at the start of mention
            return cursorPosition === m.start;
          });

          if (adjacentMention) {
            event.preventDefault();
            const newPosition = isLeftArrow
              ? adjacentMention.start
              : adjacentMention.end;
            input.setSelectionRange(newPosition, newPosition);
            return;
          }

          // Handle Ctrl/Cmd + Arrow navigation only when near mentions
          if (isCtrlOrCmd && context.mentions.length > 0) {
            // Check if cursor is inside a mention (not at boundaries)
            const currentMention = context.mentions.find(
              (m) => cursorPosition > m.start && cursorPosition < m.end,
            );

            if (currentMention) {
              event.preventDefault();
              const newPosition = isLeftArrow
                ? currentMention.start
                : currentMention.end;
              input.setSelectionRange(newPosition, newPosition);
              return;
            }

            // Find all word boundaries and mention boundaries
            const text = input.value;
            const boundaries: number[] = [];

            // Add mention boundaries
            for (const mention of context.mentions) {
              boundaries.push(mention.start);
              boundaries.push(mention.end);
            }

            // Add word boundaries
            let pos = 0;
            while (pos < text.length) {
              // Skip spaces
              while (pos < text.length && text[pos]?.match(/\s/)) pos++;
              if (pos < text.length) boundaries.push(pos);
              // Skip non-spaces
              while (pos < text.length && !text[pos]?.match(/\s/)) pos++;
              if (pos < text.length) boundaries.push(pos);
            }

            // Sort and deduplicate boundaries
            const uniqueBoundaries = [...new Set(boundaries)].sort(
              (a, b) => a - b,
            );

            // Find the next boundary position
            if (isLeftArrow) {
              // For left arrow, find the closest mention end or word boundary before cursor
              const prevBoundaries = uniqueBoundaries
                .filter((pos) => pos < cursorPosition)
                .reverse();

              // Find the closest mention end before cursor
              const closestMentionEnd = context.mentions.find(
                (m) =>
                  m.end < cursorPosition &&
                  !text.slice(m.end, cursorPosition).trim(),
              )?.start;

              // Find the closest word boundary
              const closestWordBoundary = prevBoundaries.find(
                (pos) =>
                  !context.mentions.some((m) => pos > m.start && pos < m.end),
              );

              // If there's a mention end with only whitespace between it and cursor,
              // move to the start of that mention
              if (closestMentionEnd !== undefined) {
                event.preventDefault();
                input.setSelectionRange(closestMentionEnd, closestMentionEnd);
                return;
              }

              // Otherwise move to the closest word boundary
              if (typeof closestWordBoundary === "number") {
                event.preventDefault();
                input.setSelectionRange(
                  closestWordBoundary,
                  closestWordBoundary,
                );
                return;
              }
            } else {
              // For right arrow, similar logic but looking forward
              const nextBoundaries = uniqueBoundaries.filter(
                (pos) => pos > cursorPosition,
              );

              // Find the closest mention start after cursor
              const closestMentionStart = context.mentions.find(
                (m) =>
                  m.start > cursorPosition &&
                  !text.slice(cursorPosition, m.start).trim(),
              )?.end;

              // Find the closest word boundary
              const closestWordBoundary = nextBoundaries.find(
                (pos) =>
                  !context.mentions.some((m) => pos > m.start && pos < m.end),
              );

              // If there's a mention start with only whitespace between it and cursor,
              // move to the end of that mention
              if (closestMentionStart !== undefined) {
                event.preventDefault();
                input.setSelectionRange(
                  closestMentionStart,
                  closestMentionStart,
                );
                return;
              }

              // Otherwise move to the closest word boundary
              if (typeof closestWordBoundary === "number") {
                event.preventDefault();
                input.setSelectionRange(
                  closestWordBoundary,
                  closestWordBoundary,
                );
                return;
              }
            }
          }
        }

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
              onItemSelect();
              return;
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
      [
        context.open,
        context.onOpenChange,
        context.value,
        context.onValueChange,
        context.onInputValueChange,
        context.trigger,
        context.highlightedItem,
        context.onHighlightedItemChange,
        context.onHighlightMove,
        context.filterStore,
        context.mentions,
        context.onMentionAdd,
        context.onMentionsRemove,
        context.disabled,
        context.readonly,
        context.modal,
      ],
    );

    const onSelect = React.useCallback(() => {
      if (context.disabled || context.readonly) return;
      const inputElement = context.inputRef.current;
      if (!inputElement) return;
      onMentionUpdate(inputElement);
    }, [context.disabled, context.readonly, context.inputRef, onMentionUpdate]);

    const onPaste = React.useCallback(
      (event: React.ClipboardEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;

        const inputElement = event.currentTarget;
        const pastedText = event.clipboardData.getData("text");
        const cursorPosition = inputElement.selectionStart ?? 0;
        const selectionEnd = inputElement.selectionEnd ?? cursorPosition;

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

          // Extract mention text up until whitespace or punctuation
          const match = part.match(/^([^\s.,!?;]+)/);
          if (!match?.[1]) continue;

          const mentionText = match[1].trim();
          const remainingText = part.slice(match[0].length);

          // Only process if there's mention text
          if (mentionText) {
            // Set isPasting to true to trigger item registration
            context.onIsPastingChange(true);
            // Open menu to trigger item registration
            context.onOpenChange(true);

            requestAnimationFrame(() => {
              // Check if mention exists in available items
              const mentionItem = context
                .getItems()
                .find(
                  (item) =>
                    item.value.toLowerCase() === mentionText.toLowerCase(),
                );
              const mentionLabel = mentionItem?.label;

              // Reset states
              context.onOpenChange(false);
              context.onIsPastingChange(false);

              // Calculate the position where this mention starts
              const mentionStartPosition = cursorPosition + newText.length;

              // Add the text to the new content using the actual label
              const textToAdd = `${context.trigger}${mentionLabel ?? mentionText}${remainingText}`;
              newText += textToAdd;
              currentPosition += textToAdd.length;

              // Update input value
              const newValue =
                inputElement.value.slice(0, cursorPosition) +
                newText +
                inputElement.value.slice(selectionEnd);

              inputElement.value = newValue;
              context.onInputValueChange?.(newValue);

              // Only add mention if it exists in the available items
              if (mentionItem) {
                context.onMentionAdd(mentionItem.value, mentionStartPosition);
              }

              inputElement.setSelectionRange(currentPosition, currentPosition);
            });
          }
        }
      },
      [
        context.trigger,
        context.onOpenChange,
        context.onInputValueChange,
        context.getItems,
        context.onIsPastingChange,
        context.onMentionAdd,
        context.disabled,
        context.readonly,
      ],
    );

    return (
      <div style={{ position: "relative", isolation: "isolate" }}>
        <MentionHighlighter />
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
          {...inputProps}
          ref={composedRef}
          style={{
            position: "relative",
            zIndex: 1,
            ...style,
          }}
          onChange={composeEventHandlers(inputProps.onChange, onChange)}
          onClick={composeEventHandlers(inputProps.onClick, onClick)}
          onCut={composeEventHandlers(inputProps.onCut, onCut)}
          onFocus={composeEventHandlers(inputProps.onFocus, onFocus)}
          onKeyDown={composeEventHandlers(inputProps.onKeyDown, onKeyDown)}
          onPaste={composeEventHandlers(inputProps.onPaste, onPaste)}
          onSelect={composeEventHandlers(inputProps.onSelect, onSelect)}
        />
      </div>
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { Input, MentionInput };

export type { InputElement, MentionInputProps };
