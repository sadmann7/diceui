import {
  composeEventHandlers,
  useComposedRefs,
  useTypeahead,
} from "@diceui/shared";
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

    const { onTypeaheadSearch, resetTypeahead } = useTypeahead((search) => {
      if (!context.open) {
        context.onOpenChange(true);
      }
      context.onInputValueChange(search);
      context.filterStore.search = search;
      context.onFilterItems();
    });

    const onChange = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!context.open) {
          context.onOpenChange(true);
        }

        const value = event.target.value;
        context.onInputValueChange(value);
        context.filterStore.search = value;
        context.onFilterItems();
      },
      [context],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        const isNavigationKey = [
          "ArrowDown",
          "ArrowUp",
          "Home",
          "End",
          "Enter",
          "Escape",
          ...(context.modal ? ["PageUp", "PageDown"] : []),
        ].includes(event.key);

        if (
          !isNavigationKey &&
          event.key.length === 1 &&
          !event.ctrlKey &&
          !event.metaKey &&
          !event.altKey
        ) {
          onTypeaheadSearch(event.key);
          return;
        }

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
        }
      },
      [context, onTypeaheadSearch],
    );

    React.useEffect(() => {
      return () => resetTypeahead();
    }, [resetTypeahead]);

    return (
      <Primitive.input
        type="text"
        role="combobox"
        aria-controls={context.contentId}
        aria-expanded={context.open}
        aria-activedescendant={context.highlightedItem?.id ?? context.contentId}
        aria-autocomplete="list"
        aria-labelledby={context.labelId}
        {...inputProps}
        ref={composedRefs}
        disabled={context.disabled}
        onChange={composeEventHandlers(inputProps.onChange, onChange)}
        onKeyDown={composeEventHandlers(inputProps.onKeyDown, onKeyDown)}
        onBlur={composeEventHandlers(inputProps.onBlur, () => {
          if (
            !context.multiple &&
            context.resetOnBlur &&
            context.open &&
            !context.highlightedItem &&
            context.value.length === 0
          ) {
            context.onInputValueChange("");
          }
        })}
      />
    );
  },
);

ComboboxInput.displayName = INPUT_NAME;

const Input = ComboboxInput;

export { ComboboxInput, Input };

export type { ComboboxInputProps };
