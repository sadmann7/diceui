import {
  composeEventHandlers,
  Primitive,
  setFilterSearch,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";

import { MentionHighlighter } from "./mention-highlighter";
import { type Mention, useMentionContext } from "./mention-root";

const INPUT_NAME = "MentionInput";

const SEPARATORS_PATTERN = /[-_\s./\\|:;,]+/g;
const UNWANTED_CHARS = /[^\p{L}\p{N}\s]/gu;

type InputElement = React.ElementRef<typeof Primitive.input>;

interface MentionInputProps extends React.ComponentPropsWithoutRef<
  typeof Primitive.input
> {}

const MentionInput = React.forwardRef<InputElement, MentionInputProps>(
  (props, forwardedRef) => {
    const context = useMentionContext(INPUT_NAME);
    const {
      disabled,
      filterStore,
      getEnabledItems,
      highlightedItem,
      inputValue,
      mentions,
      modal,
      onHighlightMove,
      onHighlightedItemChange,
      onInputValueChange,
      onIsPastingChange,
      onItemsFilter,
      onMentionAdd,
      onMentionsChange,
      onMentionsRemove,
      onOpenChange,
      onValueChange,
      open,
      readonly,
      trigger,
      value: contextValue,
    } = context;
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
      return Number.parseInt(style.lineHeight, 10) ?? input.offsetHeight;
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

        const containerWidth = input.clientWidth - paddingLeft - paddingRight;
        const wrappedLines = Math.floor(textWidth / containerWidth);
        const totalLines = currentLine + wrappedLines;

        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

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
      [context, calculatePosition],
    );

    const onMentionUpdate = React.useCallback(
      (element: InputElement, selectionStart: number | null = null) => {
        if (disabled || readonly) return false;

        const currentPosition = selectionStart ?? element.selectionStart;
        if (currentPosition === null) return false;

        const value = element.value;
        const lastTriggerIndex = value.lastIndexOf(trigger, currentPosition);

        if (lastTriggerIndex === -1) {
          if (open) {
            onOpenChange(false);
            onHighlightedItemChange(null);
            setFilterSearch(filterStore, "");
          }
          return false;
        }

        const isPartOfExistingMention = mentions.some(
          (mention) =>
            mention.start <= lastTriggerIndex && mention.end > lastTriggerIndex,
        );

        if (isPartOfExistingMention) {
          if (open) {
            onOpenChange(false);
            onHighlightedItemChange(null);
            setFilterSearch(filterStore, "");
          }
          return false;
        }

        // A trigger inside a word, like `user@domain`, doesn't start a mention.
        function getIsTriggerPartOfText() {
          const textBeforeTrigger = value.slice(0, lastTriggerIndex);
          const hasTextBeforeTrigger = /\S/.test(textBeforeTrigger);

          if (!hasTextBeforeTrigger) return false;

          const lastCharBeforeTrigger = textBeforeTrigger.slice(-1);
          return (
            lastCharBeforeTrigger !== " " && lastCharBeforeTrigger !== "\n"
          );
        }

        if (getIsTriggerPartOfText()) {
          if (open) {
            onOpenChange(false);
            onHighlightedItemChange(null);
            setFilterSearch(filterStore, "");
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

        const textAfterCursor = value.slice(currentPosition);
        const firstCharAfterCursor = textAfterCursor[0];
        const isTextAfterCursorSeparated =
          !firstCharAfterCursor ||
          firstCharAfterCursor === " " ||
          firstCharAfterCursor === "\n" ||
          firstCharAfterCursor === trigger;
        const isTextAfterCursorPartOfMention = mentions.some(
          (mention) =>
            currentPosition >= mention.start && currentPosition < mention.end,
        );
        const hasInterferingText =
          textAfterCursor.length > 0 &&
          !isTextAfterCursorSeparated &&
          !isTextAfterCursorPartOfMention;

        if (hasInterferingText) {
          if (open) {
            onOpenChange(false);
            onHighlightedItemChange(null);
            setFilterSearch(filterStore, "");
          }
          return false;
        }

        if (
          isValidMention &&
          (isCursorAfterTrigger || isImmediatelyAfterTrigger)
        ) {
          createVirtualElement(element, lastTriggerIndex);
          onOpenChange(true);
          setFilterSearch(
            filterStore,
            isImmediatelyAfterTrigger ? "" : textAfterTrigger,
          );
          onItemsFilter();
          return true;
        }

        if (open) {
          onOpenChange(false);
          onHighlightedItemChange(null);
          setFilterSearch(filterStore, "");
        }
        return false;
      },
      [
        open,
        onOpenChange,
        trigger,
        createVirtualElement,
        filterStore,
        onItemsFilter,
        onHighlightedItemChange,
        disabled,
        readonly,
        mentions,
      ],
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (disabled || readonly) return;
        const input = event.target;
        const newValue = input.value;
        const cursorPosition = input.selectionStart ?? 0;
        const prevValue = inputValue;
        const insertedLength = newValue.length - prevValue.length;

        if (insertedLength !== 0) {
          onMentionsChange((prev) =>
            prev.map((mention) => {
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

        onInputValueChange?.(newValue);
        onMentionUpdate(input);
      },
      [
        onInputValueChange,
        inputValue,
        onMentionsChange,
        onMentionUpdate,
        disabled,
        readonly,
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
        if (disabled || readonly) return;

        const input = event.currentTarget;
        const cursorPosition = input.selectionStart ?? 0;
        const selectionEnd = input.selectionEnd ?? cursorPosition;
        const hasSelection = cursorPosition !== selectionEnd;

        if (!hasSelection) return;

        const affectedMentions = mentions.filter(
          (m) =>
            (m.start >= cursorPosition && m.start < selectionEnd) ||
            (m.end > cursorPosition && m.end <= selectionEnd),
        );

        if (affectedMentions.length > 0) {
          // The browser copies to the clipboard; the state updates after the cut.
          requestAnimationFrame(() => {
            const remainingValues = contextValue.filter(
              (v) => !affectedMentions.some((m) => m.value === v),
            );
            onValueChange?.(remainingValues);
            onMentionsRemove(affectedMentions);
          });
        }
      },
      [
        disabled,
        readonly,
        mentions,
        contextValue,
        onValueChange,
        onMentionsRemove,
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

        if (
          (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
          !hasSelection &&
          !event.shiftKey // Don't override shift + arrow selection.
        ) {
          const isCtrlOrCmd = event.metaKey || event.ctrlKey;
          const isLeftArrow = event.key === "ArrowLeft";

          const adjacentMention = mentions.find((m) => {
            if (isLeftArrow) {
              const textBetween = input.value.slice(m.end, cursorPosition);
              const isOnlySpaces = /^\s*$/.test(textBetween);

              if (isCtrlOrCmd) {
                return (
                  cursorPosition > m.start &&
                  (cursorPosition === m.end ||
                    (cursorPosition > m.end && isOnlySpaces))
                );
              }

              return (
                cursorPosition === m.end ||
                (cursorPosition > m.end &&
                  cursorPosition <= m.end + 1 &&
                  isOnlySpaces)
              );
            }

            const textBetween = input.value.slice(cursorPosition, m.start);
            const isOnlySpaces = /^\s*$/.test(textBetween);

            if (isCtrlOrCmd) {
              return (
                (cursorPosition >= m.start && cursorPosition < m.end) ||
                (cursorPosition < m.start && isOnlySpaces)
              );
            }

            return (
              cursorPosition === m.start ||
              (cursorPosition < m.start &&
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

          // If Ctrl/Cmd is pressed but no mention found, let the browser handle word navigation.
          if (isCtrlOrCmd) return;
        }

        if (
          (event.key === "Backspace" || event.key === "Delete") &&
          hasSelection
        ) {
          const newValue =
            input.value.slice(0, cursorPosition) +
            input.value.slice(selectionEnd);

          const affectedMentions = mentions.filter(
            (m) =>
              (m.start >= cursorPosition && m.start < selectionEnd) ||
              (m.end > cursorPosition && m.end <= selectionEnd),
          );

          if (affectedMentions.length > 0) {
            event.preventDefault();

            input.value = newValue;
            onInputValueChange?.(newValue);

            const remainingValues = contextValue.filter(
              (v) => !affectedMentions.some((m) => m.value === v),
            );
            onValueChange?.(remainingValues);
            onMentionsRemove(affectedMentions);

            input.setSelectionRange(cursorPosition, cursorPosition);
            return;
          }
        }

        if (event.key === "Backspace" && !open && !hasSelection) {
          const isCtrlOrCmd = event.metaKey || event.ctrlKey;

          const mentionBeforeCursor = mentions.find((m) => {
            if (!isCtrlOrCmd) {
              return (
                cursorPosition === m.end ||
                (cursorPosition === m.end + 1 && input.value[m.end] === " ") ||
                (cursorPosition > m.start && cursorPosition <= m.end) // Mobile keyboards can leave the cursor inside a mention.
              );
            }

            const textBetween = input.value.slice(m.end, cursorPosition);
            return m.end <= cursorPosition && /^\s*$/.test(textBetween);
          });

          if (mentionBeforeCursor) {
            const hasTrailingSpace =
              input.value[mentionBeforeCursor.end] === " ";

            const isCursorInsideMention =
              cursorPosition > mentionBeforeCursor.start &&
              cursorPosition <= mentionBeforeCursor.end;

            if (isCursorInsideMention || isCtrlOrCmd) {
              event.preventDefault();
              const newValue =
                input.value.slice(0, mentionBeforeCursor.start) +
                input.value.slice(
                  mentionBeforeCursor.end + (hasTrailingSpace ? 1 : 0),
                );

              input.value = newValue;
              onInputValueChange?.(newValue);

              const remainingValues = contextValue.filter(
                (v) => v !== mentionBeforeCursor.value,
              );
              onValueChange?.(remainingValues);
              onMentionsRemove([mentionBeforeCursor]);

              const newPosition = mentionBeforeCursor.start;
              input.setSelectionRange(newPosition, newPosition);
              return;
            }

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
              onInputValueChange?.(newValue);
              input.setSelectionRange(
                mentionBeforeCursor.end,
                mentionBeforeCursor.end,
              );
              return;
            }

            event.preventDefault();
            const newValue =
              input.value.slice(0, mentionBeforeCursor.start) +
              input.value.slice(
                mentionBeforeCursor.end + (hasTrailingSpace ? 1 : 0),
              );

            input.value = newValue;
            onInputValueChange?.(newValue);

            const remainingValues = contextValue.filter(
              (v) => v !== mentionBeforeCursor.value,
            );
            onValueChange?.(remainingValues);
            onMentionsRemove([mentionBeforeCursor]);

            const newPosition = mentionBeforeCursor.start;
            input.setSelectionRange(newPosition, newPosition);
            return;
          }
        }

        if (!open) return;

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Enter",
          "Escape",
          "Tab",
          "Home",
          "End",
        ].includes(event.key);

        if (isNavigationKey && event.key !== "Tab") {
          event.preventDefault();
        }

        function onMenuClose() {
          onOpenChange(false);
          onHighlightedItemChange(null);
          setFilterSearch(filterStore, "");
        }

        function onItemSelect() {
          if (disabled || readonly || !highlightedItem) return;
          const value = highlightedItem.value;
          if (!value) return;

          const lastTriggerIndex = input.value.lastIndexOf(
            trigger,
            cursorPosition,
          );

          if (lastTriggerIndex !== -1) {
            onMentionAdd(value, lastTriggerIndex);
          }
        }

        switch (event.key) {
          case "Enter": {
            if (!highlightedItem) {
              onMenuClose();
              return;
            }
            event.preventDefault();
            onItemSelect();
            break;
          }
          case "Tab": {
            if (modal) {
              event.preventDefault();
              onItemSelect();
              return;
            }
            onMenuClose();
            break;
          }
          case "ArrowDown": {
            if (readonly) return;
            onHighlightMove(highlightedItem ? "next" : "first");
            break;
          }
          case "ArrowUp": {
            if (readonly) return;
            onHighlightMove(highlightedItem ? "prev" : "last");
            break;
          }
          case "Home": {
            if (event.metaKey || event.ctrlKey) return;
            if (readonly) return;
            event.preventDefault();
            onHighlightMove("first");
            break;
          }
          case "End": {
            if (event.metaKey || event.ctrlKey) return;
            if (readonly) return;
            event.preventDefault();
            onHighlightMove("last");
            break;
          }
          case "Escape": {
            onMenuClose();
            break;
          }
        }
      },
      [
        open,
        onOpenChange,
        contextValue,
        onValueChange,
        onInputValueChange,
        trigger,
        highlightedItem,
        onHighlightedItemChange,
        onHighlightMove,
        filterStore,
        mentions,
        onMentionAdd,
        onMentionsRemove,
        disabled,
        readonly,
        modal,
      ],
    );

    // Mobile keyboards report deletions through `beforeinput` rather than `keydown`.
    const onBeforeInput = React.useCallback(
      (event: React.FormEvent<InputElement> & { inputType?: string }) => {
        if (disabled || readonly) return;
        const input = event.currentTarget;
        const cursorPosition = input.selectionStart ?? 0;

        if (event.inputType === "deleteContentBackward") {
          const mentionAtCursor = mentions.find(
            (m) => cursorPosition > m.start && cursorPosition <= m.end,
          );

          if (mentionAtCursor) {
            event.preventDefault();
            const hasTrailingSpace = input.value[mentionAtCursor.end] === " ";

            const newValue =
              input.value.slice(0, mentionAtCursor.start) +
              input.value.slice(
                mentionAtCursor.end + (hasTrailingSpace ? 1 : 0),
              );

            input.value = newValue;
            onInputValueChange?.(newValue);

            const remainingValues = contextValue.filter(
              (v) => v !== mentionAtCursor.value,
            );
            onValueChange?.(remainingValues);
            onMentionsRemove([mentionAtCursor]);

            const newPosition = mentionAtCursor.start;
            input.setSelectionRange(newPosition, newPosition);
          }
        }
      },
      [
        disabled,
        readonly,
        mentions,
        contextValue,
        onValueChange,
        onInputValueChange,
        onMentionsRemove,
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

        const rect = input.getBoundingClientRect();
        const style = window.getComputedStyle(input);
        const paddingLeft = Number.parseFloat(style.paddingLeft);
        const clickX = event.clientX - rect.left - paddingLeft;

        const textWidth = getTextWidth(
          input.value.slice(0, input.value.length),
          input,
        );
        const charWidth = textWidth / input.value.length;
        const approximateClickPosition = Math.round(clickX / charWidth);

        const clickedMention = context.mentions.find(
          (mention) =>
            approximateClickPosition >= mention.start &&
            approximateClickPosition < mention.end,
        );

        if (clickedMention) {
          event.preventDefault();
          requestAnimationFrame(() => {
            input.setSelectionRange(clickedMention.end, clickedMention.end);
          });
        }
      },
      [context.disabled, context.readonly, context.mentions, getTextWidth],
    );

    const onPaste = React.useCallback(
      (event: React.ClipboardEvent<InputElement>) => {
        if (disabled || readonly) return;

        const inputElement = event.currentTarget;
        const pastedText = event.clipboardData.getData("text");
        const cursorPosition = inputElement.selectionStart ?? 0;
        const selectionEnd = inputElement.selectionEnd ?? cursorPosition;

        const triggerIndex = pastedText.indexOf(trigger);
        if (triggerIndex === -1) return;

        event.preventDefault();

        const parts = pastedText.split(trigger);

        let newText = "";

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
          } catch {
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
          onIsPastingChange(true);
          onOpenChange(true);

          // Waits a frame for the items to mount, otherwise they're empty.
          await new Promise((resolve) => requestAnimationFrame(resolve));

          const items = getEnabledItems();
          const newMentions: Mention[] = [];
          const newValues = [...contextValue];

          const trailingSpaces = pastedText.match(/\s+$/)?.[0] ?? "";

          for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (!part) continue;

            const words = part.split(/(\s+)/);
            let mentionText = "";
            let spaces = "";
            let remainingText = "";
            let foundValidMention = false;

            for (let wordCount = words.length; wordCount > 0; wordCount--) {
              const candidateWords = words
                .slice(0, wordCount)
                .filter((_, index) => index % 2 === 0); // The capturing split puts spaces at odd indexes.

              const candidateText = candidateWords.join(" ").trim();
              if (!candidateText) continue;

              const mentionItem = items.find(
                (item) =>
                  normalizeWithGaps(item.value) ===
                  normalizeWithGaps(candidateText),
              );

              if (mentionItem) {
                mentionText = candidateText;
                const usedWordCount = candidateWords.length;
                const usedSegments = usedWordCount * 2 - 1;

                const nextSegmentIndex = usedSegments;
                const nextSegment = words[nextSegmentIndex];
                const afterNextSegment = words[nextSegmentIndex + 1];

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

            const mentionStartPosition = cursorPosition + newText.length;

            if (foundValidMention) {
              const mentionItem = items.find(
                (item) =>
                  normalizeWithGaps(item.value) ===
                  normalizeWithGaps(mentionText),
              );

              if (mentionItem) {
                const mentionLabel = `${trigger}${mentionItem.label}`;
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
              const firstWord = words[0] ?? "";
              const spaceSegment = words[1] ?? "";
              spaces = spaceSegment?.match(/^\s+/) ? spaceSegment : "";
              remainingText = words.slice(2).join("");
              const shouldAddTrailingSpaces = i === parts.length - 1;
              newText += `${trigger}${firstWord}${spaces}${remainingText}${shouldAddTrailingSpaces ? trailingSpaces : ""}`;
            }
          }

          const finalValue =
            inputElement.value.slice(0, cursorPosition) +
            newText +
            inputElement.value.slice(selectionEnd);

          inputElement.value = finalValue;
          onInputValueChange(finalValue);

          if (newMentions.length > 0) {
            onValueChange(newValues);
            onMentionsChange((prev) => [...prev, ...newMentions]);
          }

          const newCursorPosition = cursorPosition + newText.length;
          inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

          onIsPastingChange(false);
          onOpenChange(false);
        });
      },
      [
        trigger,
        onOpenChange,
        onInputValueChange,
        contextValue,
        onValueChange,
        getEnabledItems,
        onMentionsChange,
        onIsPastingChange,
        disabled,
        readonly,
      ],
    );

    return (
      <div style={{ position: "relative" }}>
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
          {...props}
          ref={composedRef}
          onBeforeInput={composeEventHandlers(
            props.onBeforeInput,
            onBeforeInput,
          )}
          onChange={composeEventHandlers(props.onChange, onChange)}
          onClick={composeEventHandlers(props.onClick, onClick)}
          onCut={composeEventHandlers(props.onCut, onCut)}
          onFocus={composeEventHandlers(props.onFocus, onFocus)}
          onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
          onPaste={composeEventHandlers(props.onPaste, onPaste)}
          onPointerDown={composeEventHandlers(
            props.onPointerDown,
            onPointerDown,
          )}
          onSelect={composeEventHandlers(props.onSelect, onSelect)}
        />
      </div>
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { Input, MentionInput };
export type { InputElement, MentionInputProps };
