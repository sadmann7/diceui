import {
  composeEventHandlers,
  dispatchDiscreteCustomEvent,
  type HighlightingDirection,
  Primitive,
  setFilterSearch,
  useComposedRefs,
} from "@diceui/shared";
import * as React from "react";

import { ITEM_SELECT_EVENT } from "./combobox-item";
import { useComboboxContext } from "./combobox-root";

const INPUT_NAME = "ComboboxInput";

type InputElement = React.ElementRef<typeof Primitive.input>;

interface ComboboxInputProps extends React.ComponentPropsWithoutRef<
  typeof Primitive.input
> {}

const ComboboxInput = React.forwardRef<InputElement, ComboboxInputProps>(
  (props, forwardedRef) => {
    const context = useComboboxContext(INPUT_NAME);
    const {
      disabled,
      filterStore,
      getIsListEmpty,
      hasBadgeList,
      highlightedBadgeIndex,
      highlightedItem,
      inputValue,
      modal,
      multiple,
      onHighlightMove: onContextHighlightMove,
      onHighlightedBadgeIndexChange,
      onHighlightedItemChange,
      onInputValueChange,
      onItemRemove,
      onItemsFilter,
      onOpenChange,
      onSelectedTextChange,
      onValueChange,
      open,
      openOnFocus,
      preserveInputOnBlur,
      readOnly,
      selectedText,
      value: contextValue,
    } = context;
    const composedRef = useComposedRefs(forwardedRef, context.inputRef);

    const onChange = React.useCallback(
      (event: React.ChangeEvent<InputElement>) => {
        if (disabled || readOnly) return;

        if (!open) onOpenChange(true);

        const value = event.target.value;
        const trimmedValue = value.trim();

        requestAnimationFrame(() => {
          onInputValueChange(value);

          if (trimmedValue === "") {
            onValueChange(trimmedValue);
            onHighlightedItemChange(null);
          }

          setFilterSearch(filterStore, trimmedValue);
          onItemsFilter();
        });
      },
      [
        open,
        onOpenChange,
        filterStore,
        onItemsFilter,
        onInputValueChange,
        onValueChange,
        onHighlightedItemChange,
        disabled,
        readOnly,
      ],
    );

    const onFocus = React.useCallback(() => {
      if (openOnFocus && !open && !readOnly) {
        onOpenChange(true);
      }
    }, [openOnFocus, open, readOnly, onOpenChange]);

    const onBlur = React.useCallback(() => {
      if (!multiple && contextValue) {
        onInputValueChange(selectedText);
        return;
      }

      if (inputValue && !preserveInputOnBlur) {
        onInputValueChange("");
        onHighlightedItemChange(null);
      }

      if (multiple) {
        onHighlightedBadgeIndexChange(-1);
      }
    }, [
      multiple,
      contextValue,
      preserveInputOnBlur,
      onInputValueChange,
      onHighlightedItemChange,
      inputValue,
      selectedText,
      onHighlightedBadgeIndexChange,
    ]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        function onHighlightMove(direction: HighlightingDirection) {
          if (direction === "selected" && contextValue.length > 0) {
            onContextHighlightMove("selected");
          } else if (direction === "selected") {
            onContextHighlightMove("first");
          } else {
            onContextHighlightMove(direction);
          }
        }

        function onItemSelect() {
          if (disabled || readOnly || !highlightedItem) return;

          const { value, label, onSelect } = highlightedItem;

          if (!value) return;

          const itemElement = highlightedItem.ref.current;

          if (itemElement && onSelect) {
            const itemSelectEvent = new CustomEvent(ITEM_SELECT_EVENT, {
              bubbles: true,
            });

            itemElement.addEventListener(
              ITEM_SELECT_EVENT,
              () => onSelect(value),
              {
                once: true,
              },
            );

            dispatchDiscreteCustomEvent(itemElement, itemSelectEvent);
          }

          if (multiple) {
            onInputValueChange("");
          } else {
            onInputValueChange(label);
            onSelectedTextChange(label);
            onHighlightedItemChange(null);
            onOpenChange(false);
          }

          setFilterSearch(filterStore, "");
          onValueChange(value);
        }

        function onMenuOpen(direction?: HighlightingDirection) {
          if (open) return;

          onOpenChange(true);
          requestAnimationFrame(() => {
            if (direction) onHighlightMove(direction);
          });
        }

        function onMenuClose() {
          if (!open) return;

          onOpenChange(false);
          onHighlightedItemChange(null);
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
            if (multiple && hasBadgeList && highlightedBadgeIndex > -1) {
              const valueToRemove = contextValue[highlightedBadgeIndex];
              if (valueToRemove) {
                onItemRemove(valueToRemove);
                onHighlightedBadgeIndexChange(-1);
                return;
              }
            }

            if (!open) {
              if (inputValue.trim()) {
                onMenuOpen();
              } else if (!multiple && contextValue) {
                onInputValueChange(selectedText);
              }
              return;
            }

            if (!highlightedItem || getIsListEmpty()) {
              if (!multiple && contextValue) {
                onInputValueChange(selectedText);
              } else {
                onInputValueChange("");
              }
              onOpenChange(false);
              return;
            }

            onItemSelect();
            break;
          case "ArrowDown":
            if (open) {
              onHighlightMove(highlightedItem ? "next" : "first");
            } else {
              onMenuOpen(contextValue.length > 0 ? "selected" : "first");
            }
            break;
          case "ArrowUp":
            if (open) {
              onHighlightMove(highlightedItem ? "prev" : "last");
            } else {
              onMenuOpen(contextValue.length > 0 ? "selected" : "last");
            }
            break;
          case "ArrowLeft": {
            if (!multiple || !hasBadgeList) return;

            const input = event.currentTarget;
            const isAtStart =
              input.selectionStart === 0 && input.selectionEnd === 0;

            if (!isAtStart) return;

            if (open && isAtStart) {
              onHighlightedItemChange(null);
              const values = Array.isArray(contextValue) ? contextValue : [];
              if (values.length > 0) {
                event.preventDefault();
                onOpenChange(false);
                requestAnimationFrame(() => {
                  onHighlightedBadgeIndexChange(values.length - 1);
                });
              }
            } else if (!open && highlightedBadgeIndex > -1) {
              event.preventDefault();
              onHighlightedBadgeIndexChange(
                Math.max(0, highlightedBadgeIndex - 1),
              );
            } else if (!open && isAtStart) {
              const values = Array.isArray(contextValue) ? contextValue : [];
              if (values.length > 0) {
                event.preventDefault();
                onHighlightedBadgeIndexChange(values.length - 1);
              }
            }
            break;
          }
          case "ArrowRight": {
            if (!multiple || !hasBadgeList) return;

            const input = event.currentTarget;
            const isAtEnd =
              input.selectionStart === input.value.length &&
              input.selectionEnd === input.value.length;

            if (!isAtEnd) return;

            if (!open && highlightedBadgeIndex > -1) {
              event.preventDefault();
              const values = Array.isArray(contextValue) ? contextValue : [];
              if (highlightedBadgeIndex < values.length - 1) {
                onHighlightedBadgeIndexChange(highlightedBadgeIndex + 1);
              } else {
                onHighlightedBadgeIndexChange(-1);
                event.currentTarget.focus();
              }
            }
            break;
          }
          case "Home":
            if (open) onHighlightMove("first");
            break;
          case "End":
            if (open) onHighlightMove("last");
            break;
          case "PageUp":
            if (modal && open) onHighlightMove("prev");
            break;
          case "PageDown":
            if (modal && open) onHighlightMove("next");
            break;
          case "Tab":
            if (open && modal) {
              event.preventDefault();
              return;
            }
            onMenuClose();
            break;
          case "Backspace":
          case "Delete":
            if (
              multiple &&
              hasBadgeList &&
              !inputValue &&
              Array.isArray(contextValue) &&
              contextValue.length > 0
            ) {
              if (highlightedBadgeIndex > -1) {
                const valueToRemove = contextValue[highlightedBadgeIndex];
                if (valueToRemove) {
                  onItemRemove(valueToRemove);
                  const newIndex = Math.max(0, highlightedBadgeIndex - 1);
                  onHighlightedBadgeIndexChange(
                    contextValue.length > 1 ? newIndex : -1,
                  );
                }
              } else {
                const lastValue = contextValue[contextValue.length - 1];
                if (lastValue) {
                  onItemRemove(lastValue);
                }
              }
            }
            break;
          case "Escape":
            if (contextValue.length > 0 && !multiple) {
              onInputValueChange(selectedText);
            } else {
              onInputValueChange("");
            }
            onMenuClose();
            break;
        }
      },
      [
        open,
        onOpenChange,
        inputValue,
        onInputValueChange,
        onHighlightedItemChange,
        contextValue,
        highlightedItem,
        onContextHighlightMove,
        selectedText,
        highlightedBadgeIndex,
        onHighlightedBadgeIndexChange,
        onItemRemove,
        onSelectedTextChange,
        onValueChange,
        filterStore,
        getIsListEmpty,
        disabled,
        hasBadgeList,
        modal,
        multiple,
        readOnly,
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

export type { ComboboxInputProps, InputElement };
export { ComboboxInput, Input };
