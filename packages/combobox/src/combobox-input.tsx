import { composeEventHandlers, useComposedRefs } from "@diceui/shared";
import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

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

        const value = event.target.value;

        if (!context.open) {
          context.onOpenChange(true);
          requestAnimationFrame(() => {
            context.onInputValueChange(value);
            context.filterStore.search = value;
            context.onFilterItems();
          });
        } else {
          context.onInputValueChange(value);
          context.filterStore.search = value;
          context.onFilterItems();
        }
      },
      [context],
    );

    const onFocus = React.useCallback(() => {
      if (context.openOnFocus && !context.open && !context.readOnly) {
        context.onOpenChange(true);
      }
    }, [context]);

    const onBlur = React.useCallback(() => {
      if (
        context.resetOnBlur &&
        context.open &&
        !context.highlightedItem &&
        context.value.length === 0
      ) {
        context.onInputValueChange("");
      }
    }, [context]);

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        function onAnimatedHighlightMove(
          direction: Parameters<typeof context.onHighlightMove>[0],
        ) {
          requestAnimationFrame(() => {
            if (direction === "selected" && context.value.length > 0) {
              context.onHighlightMove("selected");
            } else if (direction === "selected") {
              context.onHighlightMove("first");
            } else {
              context.onHighlightMove(direction);
            }
          });
        }

        function onMenuOpen(direction?: "first" | "last" | "selected") {
          if (!context.open) {
            context.onOpenChange(true);
            if (direction) onAnimatedHighlightMove(direction);
          }
        }

        function onMenuClose() {
          if (context.open) {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
          }
        }

        function onSelection() {
          if (!context.highlightedItem) return;

          const value = context.highlightedItem.getAttribute("data-value");
          if (!value) return;

          if (!context.multiple) {
            context.onInputValueChange(
              context.highlightedItem.textContent ?? "",
            );
            context.onHighlightedItemChange(null);
            context.onOpenChange(false);
          }
          context.onInputValueChange("");
          context.onValueChange(value);
        }

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Enter",
          "Escape",
          "Tab",
          ...(context.modal ? ["PageUp", "PageDown"] : []),
        ].includes(event.key);

        if (context.readOnly) {
          switch (event.key) {
            case "Enter":
            case " ":
              event.preventDefault();
              if (context.open) {
                onSelection();
              } else {
                onMenuOpen();
              }
              break;
            case "ArrowDown":
              event.preventDefault();
              if (context.open) {
                onAnimatedHighlightMove("next");
              } else {
                onMenuOpen("selected");
              }
              break;
            case "ArrowUp":
              event.preventDefault();
              if (context.open) {
                onAnimatedHighlightMove("prev");
              } else {
                onMenuOpen("selected");
              }
              break;
            case "Escape":
              event.preventDefault();
              onMenuClose();
              break;
            case "Tab":
              onMenuClose();
              break;
          }
          return;
        }

        if (isNavigationKey && event.key !== "Tab") event.preventDefault();

        switch (event.key) {
          case "ArrowDown":
            if (!context.open) {
              onMenuOpen("selected");
            } else {
              onAnimatedHighlightMove("next");
            }
            break;
          case "ArrowUp":
            if (!context.open) {
              onMenuOpen("selected");
            } else {
              onAnimatedHighlightMove("prev");
            }
            break;
          case "Home":
            if (context.open) onAnimatedHighlightMove("first");
            break;
          case "End":
            if (context.open) onAnimatedHighlightMove("last");
            break;
          case "Enter":
            if (context.open) onSelection();
            break;
          case "Escape":
          case "Tab":
            onMenuClose();
            break;
          case "PageUp":
            if (context.modal && context.open) onAnimatedHighlightMove("prev");
            break;
          case "PageDown":
            if (context.modal && context.open) onAnimatedHighlightMove("next");
            break;
        }
      },
      [context],
    );

    return (
      <Primitive.input
        role="combobox"
        autoComplete="off"
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
