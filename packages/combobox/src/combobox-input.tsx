import { composeEventHandlers, useComposedRefs } from "@diceui/shared";
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

        const value = event.target.value;

        if (value === "") {
          context.onValueChange("");
          if (!context.open) {
            context.onOpenChange(true);
          }
          requestAnimationFrame(() => {
            context.onInputValueChange(value);
            context.filterStore.search = value;
            context.onFilterItems();
          });
          return;
        }

        if (context.open) {
          context.onInputValueChange(value);
          context.filterStore.search = value;
          context.onFilterItems();
          return;
        }

        context.onOpenChange(true);
        requestAnimationFrame(() => {
          context.onInputValueChange(value);
          context.filterStore.search = value;
          context.onFilterItems();
        });
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
        context.open &&
        !context.highlightedItem &&
        context.value.length === 0
      ) {
        context.onInputValueChange("");
      }
    }, [context]);

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

          const value = context.highlightedItem.getAttribute("data-value");
          if (!value) return;

          if (!context.multiple) {
            context.onInputValueChange(
              context.highlightedItem.textContent ?? "",
            );
            context.onHighlightedItemChange(null);
            context.onOpenChange(false);
            context.onInputValueChange("");
          }
          context.onInputValueChange(context.highlightedItem.textContent ?? "");
          context.onValueChange(value);
        }

        function onMenuOpen(direction?: HighlightingDirection) {
          if (!context.open) {
            context.onOpenChange(true);
            requestAnimationFrame(() => {
              if (direction) onHighlightMove(direction);
            });
          }
        }

        function onMenuClose() {
          if (context.open) {
            context.onOpenChange(false);
            context.onHighlightedItemChange(null);
          }
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
            if (context.open) {
              onItemSelect();
            } else {
              onMenuOpen();
            }
            break;
          case "ArrowDown":
            if (context.open) {
              onHighlightMove("next");
            } else {
              onMenuOpen(context.value.length > 0 ? "selected" : "first");
            }
            break;
          case "ArrowUp":
            if (context.open) {
              onHighlightMove("prev");
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
            onMenuClose();
            break;
        }
      },
      [context],
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
