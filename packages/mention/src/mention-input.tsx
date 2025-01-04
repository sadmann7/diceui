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
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const MentionInput = React.forwardRef<HTMLInputElement, MentionInputProps>(
  (props, forwardedRef) => {
    const context = useMentionContext(INPUT_NAME);
    const composedRef = useComposedRefs<HTMLInputElement>(
      forwardedRef,
      context.inputRef,
    );

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (context.disabled || context.readonly) return;

        const value = event.target.value;
        const lastChar = value[value.length - 1];
        const { selectionStart } = event.target;

        if (lastChar === context.triggerCharacter) {
          const rect = event.target.getBoundingClientRect();
          const lineHeight = Number.parseInt(
            getComputedStyle(event.target).lineHeight,
          );
          const lines = value.slice(0, selectionStart ?? 0).split("\n");
          const currentLine = lines.length;

          context.onTriggerPointChange({
            top: rect.top + currentLine * lineHeight,
            left: rect.left + (selectionStart ?? 0) * 8,
          });
          context.onOpenChange(true);
          context.filterStore.search = "";
          context.onHighlightedItemChange(null);
        } else if (context.open) {
          // Check if trigger character is still present and valid
          const lastTriggerIndex = value.lastIndexOf(context.triggerCharacter);
          if (!value.includes(context.triggerCharacter)) {
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
              }
            }
          }
        }

        context.onInputValueChange(value);
        context.onFilterItems();
      },
      [
        context.triggerCharacter,
        context.onInputValueChange,
        context.onOpenChange,
        context.onTriggerPointChange,
        context.onFilterItems,
        context.open,
        context.filterStore,
        context.disabled,
        context.readonly,
        context.onHighlightedItemChange,
      ],
    );

    const handleTriggerPoint = React.useCallback(
      (element: HTMLInputElement, cursorPosition: number) => {
        const rect = element.getBoundingClientRect();
        const lineHeight = Number.parseInt(
          getComputedStyle(element).lineHeight,
        );
        const lines = element.value.slice(0, cursorPosition).split("\n");
        const currentLine = lines.length;

        context.onTriggerPointChange({
          top: rect.top + currentLine * lineHeight,
          left: rect.left + cursorPosition * 8,
        });
      },
      [context.onTriggerPointChange],
    );

    const checkAndOpenMenu = React.useCallback(
      (element: HTMLInputElement) => {
        if (context.disabled || context.readonly) return;

        const { value, selectionStart } = element;
        if (selectionStart === null) return;

        const lastTriggerIndex = value.lastIndexOf(
          context.triggerCharacter,
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
            handleTriggerPoint(element, lastTriggerIndex);
            context.onOpenChange(true);
            context.filterStore.search = textAfterTrigger;
            context.onFilterItems();
          }
        }
      },
      [
        context.triggerCharacter,
        context.onOpenChange,
        context.filterStore,
        context.onFilterItems,
        context.disabled,
        context.readonly,
        handleTriggerPoint,
      ],
    );

    const onClick = React.useCallback(
      (event: React.MouseEvent<HTMLInputElement>) => {
        checkAndOpenMenu(event.currentTarget);
      },
      [checkAndOpenMenu],
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        checkAndOpenMenu(event.currentTarget);
      },
      [checkAndOpenMenu],
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
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
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
