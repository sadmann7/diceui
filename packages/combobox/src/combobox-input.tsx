import {
  DATA_VALUE_ATTR,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import {
  type HighlightingDirection,
  useComboboxContext,
} from "./combobox-root";

const INPUT_NAME = "ComboboxInput";

interface ComboboxInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const ComboboxInput = React.forwardRef<HTMLInputElement, ComboboxInputProps>(
  (props, forwardedRef) => {
    const { ...inputProps } = props;
    const context = useComboboxContext(INPUT_NAME);
    const composedRefs = useComposedRefs(forwardedRef, context.inputRef);

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (context.readOnly) return;

        if (!context.open) context.onOpenChange(true);

        const value = event.target.value;
        const trimmedValue = value.trim();

        requestAnimationFrame(() => {
          context.onInputValueChange(value);

          if (trimmedValue === "") {
            context.filterStore.search = "";
            context.onValueChange("");
            context.onHighlightedItemChange(null);
            context.onFilterItems();
            return;
          }

          context.filterStore.search = trimmedValue;
          context.onFilterItems();
        });
      },
      [
        context.open,
        context.onOpenChange,
        context.filterStore,
        context.onFilterItems,
        context.onInputValueChange,
        context.onValueChange,
        context.onHighlightedItemChange,
        context.readOnly,
      ],
    );

    const onFocus = React.useCallback(() => {
      if (context.openOnFocus && !context.open && !context.readOnly) {
        context.onOpenChange(true);
      }
    }, [
      context.openOnFocus,
      context.open,
      context.readOnly,
      context.onOpenChange,
    ]);

    const onBlur = React.useCallback(() => {
      if (!context.multiple && context.value) {
        context.onInputValueChange(context.selectedText);
        return;
      }

      if (
        !context.highlightedItem &&
        context.inputValue &&
        !context.preserveInputOnBlur
      ) {
        context.onInputValueChange("");
      }
    }, [
      context.multiple,
      context.value,
      context.preserveInputOnBlur,
      context.onInputValueChange,
      context.highlightedItem,
      context.inputValue,
      context.selectedText,
    ]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        function onHighlightMove(direction: HighlightingDirection) {
          if (direction === "selected" && context.value.length > 0) {
            context.onHighlightMove("selected");
          } else if (direction === "selected") {
            context.onHighlightMove("first");
          } else {
            context.onHighlightMove(direction);
          }
        }

        function onItemSelect() {
          if (context.readOnly || !context.highlightedItem) return;

          const value = context.highlightedItem.getAttribute(DATA_VALUE_ATTR);
          const text = context.highlightedItem.textContent ?? "";
          if (!value) return;

          if (context.multiple) {
            context.onInputValueChange("");
          } else {
            context.onInputValueChange(text);
            context.onSelectedTextChange(text);
            context.onHighlightedItemChange(null);
            context.onOpenChange(false);
          }

          context.filterStore.search = "";
          context.onValueChange(value);
        }

        function onMenuOpen(direction?: HighlightingDirection) {
          if (context.open) return;

          context.onOpenChange(true);
          requestAnimationFrame(() => {
            if (direction) onHighlightMove(direction);
          });
        }

        function onMenuClose() {
          if (!context.open) return;

          context.onOpenChange(false);
          context.onHighlightedItemChange(null);
        }

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Enter",
          "Escape",
          "Tab",
          "PageUp",
          "PageDown",
        ].includes(event.key);

        if (isNavigationKey && event.key !== "Tab") event.preventDefault();

        switch (event.key) {
          case "Enter":
            if (!context.open) {
              if (context.inputValue?.trim()) {
                onMenuOpen();
              } else if (!context.multiple && context.value) {
                context.onInputValueChange(context.selectedText);
              }
              return;
            }

            if (!context.highlightedItem) {
              if (!context.multiple && context.value) {
                context.onInputValueChange(context.selectedText);
              } else {
                context.onInputValueChange("");
              }
              context.onOpenChange(false);
              return;
            }

            onItemSelect();
            break;
          case "ArrowDown":
            if (context.open) {
              onHighlightMove(context.highlightedItem ? "next" : "first");
            } else {
              onMenuOpen(context.value.length > 0 ? "selected" : "first");
            }
            break;
          case "ArrowUp":
            if (context.open) {
              onHighlightMove(context.highlightedItem ? "prev" : "last");
            } else {
              onMenuOpen(context.value.length > 0 ? "selected" : "last");
            }
            break;
          case "Home":
            if (context.open) onHighlightMove("first");
            break;
          case "End":
            if (context.open) onHighlightMove("last");
            break;
          case "PageUp":
            if (context.modal && context.open) onHighlightMove("prev");
            break;
          case "PageDown":
            if (context.modal && context.open) onHighlightMove("next");
            break;
          case "Escape":
            onMenuClose();
            break;
          case "Tab":
            if (context.modal) {
              event.preventDefault();
              return;
            }
            onMenuClose();
            break;
        }
      },
      [
        context.open,
        context.onOpenChange,
        context.inputValue,
        context.onInputValueChange,
        context.onSelectedTextChange,
        context.onHighlightedItemChange,
        context.value,
        context.onValueChange,
        context.highlightedItem,
        context.onHighlightMove,
        context.selectedText,
        context.readOnly,
        context.multiple,
        context.modal,
        context.filterStore,
      ],
    );

    return (
      <Primitive.input
        role="combobox"
        autoCapitalize="off"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        aria-expanded={context.open}
        aria-controls={context.contentId}
        aria-autocomplete="list"
        aria-activedescendant={context.highlightedItem?.id}
        aria-disabled={context.disabled}
        aria-readonly={context.readOnly}
        disabled={context.disabled}
        readOnly={context.readOnly}
        {...inputProps}
        ref={composedRefs}
        value={context.inputValue}
        onChange={composeEventHandlers(inputProps.onChange, onChange)}
        onFocus={composeEventHandlers(inputProps.onFocus, onFocus)}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, onKeyDown)}
        onBlur={composeEventHandlers(inputProps.onBlur, onBlur)}
      />
    );
  },
);

ComboboxInput.displayName = INPUT_NAME;

const Input = ComboboxInput;

export { ComboboxInput, Input };

export type { ComboboxInputProps };
