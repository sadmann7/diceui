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

    const calculatePosition = React.useCallback(
      (input: HTMLInputElement, cursorPosition: number) => {
        // Get input's bounding rect relative to viewport
        const rect = input.getBoundingClientRect();
        const style = window.getComputedStyle(input);
        const lineHeight =
          Number.parseInt(style.lineHeight) || input.offsetHeight;
        const paddingLeft = Number.parseInt(style.paddingLeft) || 0;
        const paddingTop = Number.parseInt(style.paddingTop) || 0;

        // Create a temporary span to measure text width accurately
        const measureSpan = document.createElement("span");
        measureSpan.style.cssText = `
          position: absolute;
          visibility: hidden;
          white-space: pre;
          font: ${style.font};
          letter-spacing: ${style.letterSpacing};
          text-transform: ${style.textTransform};
        `;
        document.body.appendChild(measureSpan);

        // Measure the text width up to the cursor
        const textUpToCursor = input.value.slice(0, cursorPosition);
        measureSpan.textContent = textUpToCursor;
        const textWidth = measureSpan.offsetWidth;
        document.body.removeChild(measureSpan);

        // Calculate current line based on text content
        const lines = textUpToCursor.split("\n");
        const currentLine = lines.length - 1;

        // Get scroll position
        const scrollTop = input.scrollTop;
        const scrollLeft = input.scrollLeft;

        // Calculate coordinates relative to viewport
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
        };
      },
      [],
    );

    const createVirtualElement = React.useCallback(
      (element: HTMLInputElement, cursorPosition: number) => {
        const virtualElement = {
          getBoundingClientRect() {
            // Recalculate position on each call to ensure accuracy
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

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (context.disabled || context.readonly) return;

        const value = event.target.value;
        const lastChar = value[value.length - 1];
        const { selectionStart } = event.target;

        if (lastChar === context.trigger) {
          const input = event.target;
          createVirtualElement(input, selectionStart ?? 0);
          context.onOpenChange(true);
          context.filterStore.search = "";
          context.onHighlightedItemChange(null);
        } else if (context.open) {
          // Check if trigger character is still present and valid
          const lastTriggerIndex = value.lastIndexOf(context.trigger);
          if (!value.includes(context.trigger)) {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
            context.filterStore.search = "";
          } else if (lastTriggerIndex !== -1) {
            const nextChar = value[lastTriggerIndex + 1];
            // Close if there's a space right after trigger or no character after trigger
            if (nextChar === " " || nextChar === undefined) {
              context.onOpenChange(false);
              context.onHighlightedItemChange(null);
              context.filterStore.search = "";
            } else {
              // Extract text after the last trigger character
              const searchTerm = value.slice(lastTriggerIndex + 1);
              // Close if search term contains spaces
              if (searchTerm.includes(" ")) {
                context.onOpenChange(false);
                context.onHighlightedItemChange(null);
                context.filterStore.search = "";
              } else {
                context.filterStore.search = searchTerm;
                // Update position as user types
                createVirtualElement(event.target, lastTriggerIndex);
              }
            }
          }
        }

        context.onInputValueChange(value);
        context.onFilterItems();
      },
      [
        context.trigger,
        context.onInputValueChange,
        context.onOpenChange,
        context.onFilterItems,
        context.open,
        context.filterStore,
        context.disabled,
        context.readonly,
        context.onHighlightedItemChange,
        createVirtualElement,
      ],
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

        // Check if cursor is after a trigger character
        if (lastTriggerIndex !== -1 && selectionStart > lastTriggerIndex) {
          const textAfterTrigger = value.slice(
            lastTriggerIndex + 1,
            selectionStart,
          );
          // Only open if there are no spaces in the mention text
          if (!textAfterTrigger.includes(" ")) {
            createVirtualElement(element, lastTriggerIndex);
            context.onOpenChange(true);
            context.filterStore.search = textAfterTrigger;
            context.onFilterItems();
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
          if (context.readonly || !context.highlightedItem) return;
          const value = context.highlightedItem.value;
          if (!value) return;

          context.onValueChange([...context.value, value]);
          context.onHighlightedItemChange(null);
          context.onOpenChange(false);
          context.filterStore.search = "";
        }

        switch (event.key) {
          case "Enter": {
            if (!context.highlightedItem) {
              onMenuClose();
              return;
            }
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

    return (
      <Primitive.input
        role="combobox"
        id={context.inputId}
        autoComplete="off"
        aria-expanded={context.open}
        aria-controls={context.contentId}
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
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
        onClick={composeEventHandlers(props.onClick, onClick)}
        onFocus={composeEventHandlers(props.onFocus, onFocus)}
      />
    );
  },
);

MentionInput.displayName = INPUT_NAME;

const Input = MentionInput;

export { Input, MentionInput };

export type { MentionInputProps };
