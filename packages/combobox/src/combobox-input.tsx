import {
  type HighlightingDirection,
  Primitive,
  composeEventHandlers,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const INPUT_NAME = "ComboboxInput";

type InputElement = React.ElementRef<typeof Primitive.input>;

interface ComboboxInputProps
  extends React.ComponentPropsWithoutRef<typeof Primitive.input> {}

const ComboboxInput = React.forwardRef<InputElement, ComboboxInputProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(INPUT_NAME);
    const composedRef = useComposedRefs(forwardedRef, context.inputRef);

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (context.disabled || context.readOnly) return;

        if (!context.open) context.onOpenChange(true);

        const value = event.target.value;
        const trimmedValue = value.trim();

        requestAnimationFrame(() => {
          context.onInputValueChange(value);

          if (trimmedValue === "") {
            context.onValueChange(trimmedValue);
            context.onHighlightedItemChange(null);
          }

          context.filterStore.search = trimmedValue;
          context.onItemsFilter();
        });
      },
      [
        context.open,
        context.onOpenChange,
        context.filterStore,
        context.onItemsFilter,
        context.onInputValueChange,
        context.onValueChange,
        context.onHighlightedItemChange,
        context.disabled,
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

      if (context.inputValue && !context.preserveInputOnBlur) {
        context.onInputValueChange("");
        context.onHighlightedItemChange(null);
      }

      if (context.multiple) {
        context.onHighlightedBadgeIndexChange(-1);
      }
    }, [
      context.multiple,
      context.value,
      context.preserveInputOnBlur,
      context.onInputValueChange,
      context.onHighlightedItemChange,
      context.inputValue,
      context.selectedText,
      context.onHighlightedBadgeIndexChange,
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
          if (context.disabled || context.readOnly || !context.highlightedItem)
            return;

          const value = context.highlightedItem.value;
          const label = context.highlightedItem.label;
          if (!value) return;

          if (context.multiple) {
            context.onInputValueChange("");
          } else {
            context.onInputValueChange(label);
            context.onSelectedTextChange(label);
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
            if (context.multiple && context.highlightedBadgeIndex > -1) {
              const valueToRemove =
                context.value[context.highlightedBadgeIndex];
              if (valueToRemove) {
                context.onItemRemove(valueToRemove);
                context.onHighlightedBadgeIndexChange(-1);
                return;
              }
            }

            if (!context.open) {
              if (context.inputValue.trim()) {
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
          case "ArrowLeft": {
            if (!context.multiple) return;
            console.log("ArrowLeft");

            const input = event.currentTarget;
            const isAtStart =
              input.selectionStart === 0 && input.selectionEnd === 0;

            if (!isAtStart) return;

            if (context.open && isAtStart) {
              context.onHighlightedItemChange(null);
              const values = Array.isArray(context.value) ? context.value : [];
              if (values.length > 0) {
                event.preventDefault();
                context.onOpenChange(false);
                requestAnimationFrame(() => {
                  context.onHighlightedBadgeIndexChange(values.length - 1);
                });
              }
            } else if (!context.open && context.highlightedBadgeIndex > -1) {
              event.preventDefault();
              context.onHighlightedBadgeIndexChange(
                Math.max(0, context.highlightedBadgeIndex - 1),
              );
            } else if (!context.open && isAtStart) {
              const values = Array.isArray(context.value) ? context.value : [];
              if (values.length > 0) {
                event.preventDefault();
                context.onHighlightedBadgeIndexChange(values.length - 1);
              }
            }
            break;
          }
          case "ArrowRight": {
            if (!context.multiple) return;
            console.log("ArrowRight");
            const input = event.currentTarget;
            const isAtEnd =
              input.selectionStart === input.value.length &&
              input.selectionEnd === input.value.length;

            if (!isAtEnd) return;

            if (!context.open && context.highlightedBadgeIndex > -1) {
              event.preventDefault();
              const values = Array.isArray(context.value) ? context.value : [];
              if (context.highlightedBadgeIndex < values.length - 1) {
                context.onHighlightedBadgeIndexChange(
                  context.highlightedBadgeIndex + 1,
                );
              } else {
                context.onHighlightedBadgeIndexChange(-1);
                event.currentTarget.focus();
              }
            }
            break;
          }
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
            if (context.value.length > 0 && !context.multiple) {
              context.onInputValueChange(context.selectedText);
            } else {
              context.onInputValueChange("");
            }
            onMenuClose();
            break;
          case "Tab":
            if (context.open && context.modal) {
              event.preventDefault();
              return;
            }
            onMenuClose();
            break;
          case "Backspace":
            if (
              context.multiple &&
              !context.inputValue &&
              Array.isArray(context.value) &&
              context.value.length > 0
            ) {
              if (context.highlightedBadgeIndex > -1) {
                const valueToRemove =
                  context.value[context.highlightedBadgeIndex];
                if (valueToRemove) {
                  context.onItemRemove(valueToRemove);
                  context.onHighlightedBadgeIndexChange(-1);
                }
              } else {
                context.onHighlightedBadgeIndexChange(context.value.length - 1);
              }
            }
            break;
          case "Delete":
            if (
              context.multiple &&
              context.highlightedBadgeIndex > -1 &&
              Array.isArray(context.value)
            ) {
              const valueToRemove =
                context.value[context.highlightedBadgeIndex];
              if (valueToRemove) {
                context.onItemRemove(valueToRemove);
                context.onHighlightedBadgeIndexChange(-1);
              }
            }
            break;
        }
      },
      [
        context.open,
        context.onOpenChange,
        context.inputValue,
        context.onInputValueChange,
        context.onHighlightedItemChange,
        context.value,
        context.highlightedItem,
        context.onHighlightMove,
        context.selectedText,
        context.multiple,
        context.modal,
        context.highlightedBadgeIndex,
        context.onHighlightedBadgeIndexChange,
        context.onItemRemove,
        context.onSelectedTextChange,
        context.onValueChange,
        context.filterStore,
        context.disabled,
        context.readOnly,
      ],
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
        aria-controls={context.listId}
        aria-labelledby={context.labelId}
        aria-autocomplete="list"
        aria-activedescendant={context.highlightedItem?.ref?.current?.id}
        aria-disabled={context.disabled}
        aria-readonly={context.readOnly}
        dir={context.dir}
        disabled={context.disabled}
        readOnly={context.readOnly}
        {...props}
        ref={composedRef}
        value={context.inputValue}
        onChange={composeEventHandlers(props.onChange, onChange)}
        onFocus={composeEventHandlers(props.onFocus, onFocus)}
        onKeyDown={composeEventHandlers(props.onKeyDown, onKeyDown)}
        onBlur={composeEventHandlers(props.onBlur, onBlur)}
      />
    );
  },
);

ComboboxInput.displayName = INPUT_NAME;

const Input = ComboboxInput;

export { ComboboxInput, Input };

export type { ComboboxInputProps, InputElement };
