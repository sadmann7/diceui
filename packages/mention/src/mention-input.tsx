import {
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { MentionHighlighter } from "./mention-highlighter";
import { type Mention, useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

const SEPARATORS_PATTERN = /[-_\s./\\|:;,]+/g;
const UNWANTED_CHARS = /[^\p{L}\p{N}\s]/gu;

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
        const paddingRight = Number.parseFloat(
          style.getPropertyValue("padding-right") ?? "0",
        );
        const paddingTop = Number.parseFloat(
          style.getPropertyValue("padding-top") ?? "0",
        );

        // Calculate wrapped lines before cursor
        const containerWidth = input.clientWidth - paddingLeft - paddingRight;
        const wrappedLines = Math.floor(textWidth / containerWidth);
        const totalLines = currentLine + wrappedLines;

        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

        // Calculate x position considering text wrapping and RTL
        const effectiveTextWidth = textWidth % containerWidth;
        const isRTL = context.dir === "rtl";
        const x = isRTL
          ? Math.min(
              rect.right - paddingRight - effectiveTextWidth + scrollLeft,
              rect.right - 10,
            )
          : Math.min(
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
      [getTextWidth, getLineHeight, context.dir],
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

        // Check if the trigger is part of an existing mention
        const isPartOfExistingMention = context.mentions.some(
          (mention) =>
            mention.start <= lastTriggerIndex && mention.end > lastTriggerIndex,
        );

        if (isPartOfExistingMention) {
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

        // Check if there's any text after the cursor position
        const textAfterCursor = value.slice(currentPosition).trim();
        const hasCompletedText =
          textAfterCursor.length > 0 && !textAfterCursor.startsWith(" ");
        if (hasCompletedText) {
          if (context.open) {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.filterStore.search = "";
          }
          return false;
        }

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
        context.mentions,
      ],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;
        const input = event.target;
        const newValue = input.value;
        const cursorPosition = input.selectionStart ?? 0;
        const prevValue = context.inputValue;
        const insertedLength = newValue.length - prevValue.length;

        // Update mentions positions based on text changes
        if (insertedLength !== 0) {
          context.onMentionsChange((prev) =>
            prev.map((mention) => {
              // Only update positions for mentions that come after the cursor
              if (
                mention.start >=
                cursorPosition - (insertedLength > 0 ? insertedLength : 0)
              ) {
                return {
                  ...mention,
                  start: mention.start + insertedLength,
                  end: mention.end + insertedLength,
                };
              }
              return mention;
            }),
          );
        }

        context.onInputValueChange?.(newValue);
        onMentionUpdate(input);
      },
      [
        context.onInputValueChange,
        context.inputValue,
        context.onMentionsChange,
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

          // Find mention that's immediately before or after cursor, considering spaces
          const adjacentMention = context.mentions.find((m) => {
            if (isLeftArrow) {
              // For left arrow, check if cursor is at or before the end of mention (including spaces)
              const textBetween = input.value.slice(m.end, cursorPosition);
              const isOnlySpaces = /^\s*$/.test(textBetween);

              // Handle Ctrl/Cmd differently - jump to start of mention
              if (isCtrlOrCmd) {
                return (
                  cursorPosition > m.start && // Cursor after mention start
                  (cursorPosition === m.end || // Cursor at mention end
                    (cursorPosition > m.end && // Or after mention end with only spaces
                      isOnlySpaces)) // Only spaces between
                );
              }

              // Regular arrow key - move one position at a time
              return (
                cursorPosition === m.end || // At mention end
                (cursorPosition > m.end && // Or after mention with only spaces
                  cursorPosition <= m.end + 1 &&
                  isOnlySpaces)
              );
            }

            // For right arrow
            const textBetween = input.value.slice(cursorPosition, m.start);
            const isOnlySpaces = /^\s*$/.test(textBetween);

            // Handle Ctrl/Cmd differently - jump to end of mention
            if (isCtrlOrCmd) {
              return (
                (cursorPosition >= m.start && cursorPosition < m.end) || // Cursor inside mention
                (cursorPosition < m.start && // Or cursor before mention start
                  isOnlySpaces) // Only spaces between
              );
            }

            // Regular arrow key - move one position at a time
            return (
              cursorPosition === m.start || // At mention start
              (cursorPosition < m.start && // Or before mention with only spaces
                cursorPosition >= m.start - 1 &&
                isOnlySpaces)
            );
          });

          if (adjacentMention) {
            event.preventDefault();
            const newPosition = isCtrlOrCmd
              ? isLeftArrow
                ? adjacentMention.start
                : adjacentMention.end
              : isLeftArrow
                ? cursorPosition > adjacentMention.end
                  ? adjacentMention.end
                  : adjacentMention.start
                : cursorPosition < adjacentMention.start
                  ? adjacentMention.start
                  : adjacentMention.end;
            input.setSelectionRange(newPosition, newPosition);
            return;
          }

          // If Ctrl/Cmd is pressed but no mention found, let the browser handle word navigation
          if (isCtrlOrCmd) return;
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
          const isCtrlOrCmd = event.metaKey || event.ctrlKey;

          // Find the mention that's immediately before the cursor
          const mentionBeforeCursor = context.mentions.find((m) => {
            // For regular backspace, check if cursor is right after mention (accounting for space)
            if (!isCtrlOrCmd) {
              return (
                cursorPosition === m.end || // Cursor exactly at end
                (cursorPosition === m.end + 1 && input.value[m.end] === " ")
              ); // Or after space
            }

            // For Cmd/Ctrl + Backspace, check if there's no meaningful text between cursor and mention
            const textBetween = input.value.slice(m.end, cursorPosition);
            return /^\s*$/.test(textBetween); // Only whitespace between mention and cursor
          });

          if (mentionBeforeCursor) {
            const hasTrailingSpace =
              input.value[mentionBeforeCursor.end] === " ";

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

    const onPointerDown = React.useCallback(
      (event: React.PointerEvent<InputElement>) => {
        if (context.disabled || context.readonly) return;
        const input = event.currentTarget;

        // Get click position relative to input
        const rect = input.getBoundingClientRect();
        const style = window.getComputedStyle(input);
        const paddingLeft = Number.parseFloat(style.paddingLeft);
        const clickX = event.clientX - rect.left - paddingLeft;

        // Calculate approximate character position
        const textWidth = getTextWidth(
          input.value.slice(0, input.value.length),
          input,
        );
        const charWidth = textWidth / input.value.length;
        const approximateClickPosition = Math.round(clickX / charWidth);

        // Find if click is within a mention
        const clickedMention = context.mentions.find(
          (mention) =>
            approximateClickPosition >= mention.start &&
            approximateClickPosition < mention.end,
        );

        if (clickedMention) {
          event.preventDefault();
          // Move cursor to end of mention
          requestAnimationFrame(() => {
            input.setSelectionRange(clickedMention.end, clickedMention.end);
          });
        }
      },
      [context.disabled, context.readonly, context.mentions, getTextWidth],
    );

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

        // Handle first part (before any triggers)
        if (parts[0]) {
          newText += parts[0];
        }

        function normalizeWithGaps(str: string) {
          if (!str) return "";
          if (typeof str !== "string") return "";

          let normalized: string;
          try {
            normalized = str
              .toLowerCase()
              .normalize("NFC")
              .replace(UNWANTED_CHARS, " ")
              .replace(SEPARATORS_PATTERN, " ")
              .trim()
              .replace(/\s+/g, "");
          } catch (_err) {
            normalized = str
              .toLowerCase()
              .normalize("NFC")
              .replace(/[^a-z0-9\s]/g, " ")
              .trim()
              .replace(/\s+/g, "");
          }

          return normalized;
        }

        requestAnimationFrame(async () => {
          // Register items
          context.onIsPastingChange(true);
          context.onOpenChange(true);

          // Wait for the next frame to ensure the DOM is updated, otherwise the items will be empty
          await new Promise((resolve) => requestAnimationFrame(resolve));

          // Process remaining parts that come after triggers
          const items = context.getEnabledItems();
          const newMentions: Mention[] = [];
          const newValues = [...context.value];

          // Keep track of trailing spaces after the last part
          const trailingSpaces = pastedText.match(/\s+$/)?.[0] ?? "";

          for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            // Try to find the longest valid mention by checking each word combination
            const words = part.split(/(\s+)/);
            let mentionText = "";
            let spaces = "";
            let remainingText = "";
            let foundValidMention = false;

            // Try combinations from longest to shortest, preserving spaces
            for (let wordCount = words.length; wordCount > 0; wordCount--) {
              // Join only non-space segments for the candidate text
              const candidateWords = words
                .slice(0, wordCount)
                .filter((_, index) => index % 2 === 0); // Take only non-space segments

              const candidateText = candidateWords.join(" ").trim();
              if (!candidateText) continue;

              // Check if mention exists in available items
              const mentionItem = items.find(
                (item) =>
                  normalizeWithGaps(item.value) ===
                  normalizeWithGaps(candidateText),
              );

              if (mentionItem) {
                mentionText = candidateText;
                // Calculate how many segments we used (including spaces)
                const usedWordCount = candidateWords.length;
                const usedSegments = usedWordCount * 2 - 1;

                // Get spaces after the mention (if any)
                const nextSegmentIndex = usedSegments;
                const nextSegment = words[nextSegmentIndex];
                const afterNextSegment = words[nextSegmentIndex + 1];

                // If next segment is a space and there's text after it, keep the space
                if (nextSegment?.match(/^\s+/) && afterNextSegment) {
                  spaces = nextSegment;
                  remainingText = words.slice(nextSegmentIndex + 1).join("");
                } else {
                  spaces = "";
                  remainingText = words.slice(nextSegmentIndex).join("");
                }

                foundValidMention = true;
                break;
              }
            }

            // Calculate the position where this mention starts
            const mentionStartPosition = cursorPosition + newText.length;

            if (foundValidMention) {
              // Find matching item again (we know it exists)
              const mentionItem = items.find(
                (item) =>
                  normalizeWithGaps(item.value) ===
                  normalizeWithGaps(mentionText),
              );

              if (mentionItem) {
                // Add mention with its label
                const mentionLabel = `${context.trigger}${mentionItem.label}`;
                // Add trailing spaces only if this is the last part and there's no remaining text
                const shouldAddTrailingSpaces =
                  i === parts.length - 1 && !remainingText;
                newText +=
                  mentionLabel +
                  spaces +
                  remainingText +
                  (shouldAddTrailingSpaces ? trailingSpaces : "");

                newValues.push(mentionItem.value);
                newMentions.push({
                  value: mentionItem.value,
                  start: mentionStartPosition,
                  end: mentionStartPosition + mentionLabel.length,
                });
              }
            } else {
              // If no valid mention found, keep first word and spaces as original text
              const firstWord = words[0] ?? "";
              const spaceSegment = words[1] ?? "";
              spaces = spaceSegment?.match(/^\s+/) ? spaceSegment : "";
              remainingText = words.slice(2).join("");
              // Add trailing spaces only if this is the last part
              const shouldAddTrailingSpaces = i === parts.length - 1;
              newText += `${context.trigger}${firstWord}${spaces}${remainingText}${shouldAddTrailingSpaces ? trailingSpaces : ""}`;
            }
          }

          // Update input value
          const finalValue =
            inputElement.value.slice(0, cursorPosition) +
            newText +
            inputElement.value.slice(selectionEnd);

          inputElement.value = finalValue;
          context.onInputValueChange(finalValue);

          // Update mentions and values
          if (newMentions.length > 0) {
            context.onValueChange(newValues);
            context.onMentionsChange((prev) => [...prev, ...newMentions]);
          }

          // Set cursor position after all mentions
          const newCursorPosition = cursorPosition + newText.length;
          inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

          // Cleanup after all operations are complete
          context.onIsPastingChange(false);
          context.onOpenChange(false);
        });
      },
      [
        context.trigger,
        context.onOpenChange,
        context.onInputValueChange,
        context.value,
        context.onValueChange,
        context.getEnabledItems,
        context.onMentionsChange,
        context.onIsPastingChange,
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
          dir={context.dir}
          {...inputProps}
          ref={composedRef}
          style={{
            position: "relative",
            zIndex: 1,
            ...style,
          }}
          onChange={composeEventHandlers(inputProps.onChange, onChange)}
          onClick={composeEventHandlers(inputProps.onClick, onClick)}
          onPointerDown={composeEventHandlers(
            inputProps.onPointerDown,
            onPointerDown,
          )}
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
