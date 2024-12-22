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
        if (context.readOnly) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!context.open) {
              context.onOpenChange(true);
            }
          }
          return;
        }

        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Enter",
          "Escape",
          ...(context.modal ? ["PageUp", "PageDown"] : []),
        ].includes(event.key);

        if (isNavigationKey) event.preventDefault();

        switch (event.key) {
          case "ArrowDown":
            if (!context.open) {
              context.onOpenChange(true);
              requestAnimationFrame(() => {
                if (context.value.length > 0) {
                  context.onHighlightMove("selected");
                } else {
                  context.onHighlightMove("first");
                }
              });
            } else {
              context.onHighlightMove("next");
            }
            break;
          case "ArrowUp":
            if (!context.open) {
              context.onOpenChange(true);
              requestAnimationFrame(() => {
                if (context.value.length > 0) {
                  context.onHighlightMove("selected");
                } else {
                  context.onHighlightMove("last");
                }
              });
            } else {
              context.onHighlightMove("prev");
            }
            break;
          case "Home":
            if (context.open) {
              context.onHighlightMove("first");
            }
            break;
          case "End":
            if (context.open) {
              context.onHighlightMove("last");
            }
            break;
          case "Enter":
            if (context.open && context.highlightedItem) {
              const value = context.highlightedItem.getAttribute("data-value");
              if (value) {
                if (!context.multiple) {
                  context.onInputValueChange(
                    context.highlightedItem.textContent ?? "",
                  );
                  context.onHighlightedItemChange(null);
                  context.onOpenChange(false);
                }
                context.onValueChange(value);
              }
            }
            break;
          case "Escape":
            if (context.open) {
              context.onOpenChange(false);
              context.onHighlightedItemChange(null);
            }
            break;
          case "PageUp":
            if (context.modal && context.open) {
              context.onHighlightMove("prev");
            }
            break;
          case "PageDown":
            if (context.modal && context.open) {
              context.onHighlightMove("next");
            }
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
