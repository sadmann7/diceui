"use client";

import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ARROW_UP = "ArrowUp";
const ARROW_DOWN = "ArrowDown";
const ARROW_LEFT = "ArrowLeft";
const ARROW_RIGHT = "ArrowRight";
const HOME = "Home";
const END = "End";
const ENTER = "Enter";
const SPACE = " ";

const SELECTABLE_NAME = "Selectable";
const SELECTABLE_ITEM_NAME = "SelectableItem";

const SELECTABLE_ERROR = {
  [SELECTABLE_NAME]: `\`${SELECTABLE_NAME}\` must be used as root component`,
  [SELECTABLE_ITEM_NAME]: `\`${SELECTABLE_ITEM_NAME}\` must be within \`${SELECTABLE_NAME}\``,
} as const;

interface SelectableContextValue {
  id: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  collectionRef: React.RefObject<Array<HTMLElement | null>>;
}

const SelectableContext = React.createContext<SelectableContextValue | null>(
  null,
);
SelectableContext.displayName = SELECTABLE_NAME;

function useSelectableContext(name: keyof typeof SELECTABLE_ERROR) {
  const context = React.useContext(SelectableContext);
  if (!context) {
    throw new Error(SELECTABLE_ERROR[name]);
  }
  return context;
}

interface SelectableRootProps extends React.ComponentPropsWithoutRef<"div"> {
  id?: string;
  defaultSelectedIndex?: number;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  asChild?: boolean;
}

function findEnabledIndex(
  collectionRef: React.RefObject<Array<ItemElement | null>>,
  {
    startingIndex,
    disabledIndices,
    decrement = false,
    loop = false,
  }: {
    startingIndex: number;
    disabledIndices?: number[];
    decrement?: boolean;
    loop?: boolean;
  },
): number {
  const len = collectionRef.current.length;
  let index = startingIndex;

  do {
    index = decrement ? index - 1 : index + 1;

    // Handle loop around only if loop is true
    if (loop) {
      if (index < 0) {
        index = len - 1;
      } else if (index >= len) {
        index = 0;
      }
    } else {
      // If loop is false, stop at boundaries
      if (index < 0 || index >= len) {
        return decrement ? 0 : len - 1;
      }
    }

    // Check if the index is disabled
    const isIndexDisabled = disabledIndices?.includes(index) || false;

    if (!isIndexDisabled) {
      return index;
    }
  } while (index !== startingIndex);

  // If all indices are disabled, return the starting index
  return startingIndex;
}

function getMinIndex(
  collectionRef: React.RefObject<Array<ItemElement | null>>,
  disabledIndices?: number[],
): number {
  const len = collectionRef.current.length;

  for (let i = 0; i < len; i++) {
    if (!disabledIndices?.includes(i)) {
      return i;
    }
  }

  return 0;
}

function getMaxIndex(
  collectionRef: React.RefObject<Array<ItemElement | null>>,
  disabledIndices?: number[],
): number {
  const len = collectionRef.current.length;

  for (let i = len - 1; i >= 0; i--) {
    if (!disabledIndices?.includes(i)) {
      return i;
    }
  }

  return len - 1;
}

const SelectableRoot = React.forwardRef<HTMLDivElement, SelectableRootProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      defaultSelectedIndex = -1,
      selectedIndex: selectedIndexProp,
      onSelectedIndexChange,
      orientation = "vertical",
      loop = false,
      dir = "ltr",
      disabled = false,
      virtual = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const [uncontrolledSelectedIndex, setUncontrolledSelectedIndex] =
      React.useState(defaultSelectedIndex);

    const selectedIndex = selectedIndexProp ?? uncontrolledSelectedIndex;
    const isControlled = selectedIndexProp !== undefined;

    const collectionRef = React.useRef<ItemElement[]>([]);

    const onSelect = React.useCallback(
      (index: number) => {
        if (!isControlled) {
          setUncontrolledSelectedIndex(index);
        }
        onSelectedIndexChange?.(index);
      },
      [isControlled, onSelectedIndexChange],
    );

    const contextValue = React.useMemo<SelectableContextValue>(
      () => ({
        id,
        selectedIndex,
        onSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
        collectionRef,
      }),
      [id, selectedIndex, onSelect, orientation, loop, dir, disabled, virtual],
    );

    const RootSlot = asChild ? Slot : "div";

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return;

        const isRtl = dir === "rtl";
        const isVertical =
          orientation === "vertical" || orientation === "mixed";
        const isHorizontal =
          orientation === "horizontal" || orientation === "mixed";

        const items = collectionRef.current;
        const itemCount = items.length;

        if (itemCount === 0) return;

        // Get the current index, defaulting to first item if none selected
        const currentIndex = selectedIndex >= 0 ? selectedIndex : 0;
        let nextIndex = currentIndex;

        switch (event.key) {
          case HOME:
            nextIndex = getMinIndex(collectionRef);
            event.preventDefault();
            break;

          case END:
            nextIndex = getMaxIndex(collectionRef);
            event.preventDefault();
            break;

          case ARROW_UP:
            if (isVertical) {
              nextIndex = loop
                ? findEnabledIndex(collectionRef, {
                    startingIndex: currentIndex,
                    decrement: true,
                    loop,
                  })
                : Math.max(
                    0,
                    findEnabledIndex(collectionRef, {
                      startingIndex: currentIndex,
                      decrement: true,
                      loop,
                    }),
                  );
              event.preventDefault();
            }
            break;

          case ARROW_DOWN:
            if (isVertical) {
              nextIndex = loop
                ? findEnabledIndex(collectionRef, {
                    startingIndex: currentIndex,
                    loop,
                  })
                : Math.min(
                    itemCount - 1,
                    findEnabledIndex(collectionRef, {
                      startingIndex: currentIndex,
                      loop,
                    }),
                  );
              event.preventDefault();
            }
            break;

          case ARROW_LEFT:
            if (isHorizontal) {
              nextIndex = loop
                ? findEnabledIndex(collectionRef, {
                    startingIndex: currentIndex,
                    decrement: !isRtl,
                    loop,
                  })
                : Math.max(
                    0,
                    findEnabledIndex(collectionRef, {
                      startingIndex: currentIndex,
                      decrement: !isRtl,
                      loop,
                    }),
                  );
              event.preventDefault();
            }
            break;

          case ARROW_RIGHT:
            if (isHorizontal) {
              nextIndex = loop
                ? findEnabledIndex(collectionRef, {
                    startingIndex: currentIndex,
                    decrement: isRtl,
                    loop,
                  })
                : Math.min(
                    itemCount - 1,
                    findEnabledIndex(collectionRef, {
                      startingIndex: currentIndex,
                      decrement: isRtl,
                      loop,
                    }),
                  );
              event.preventDefault();
            }
            break;

          case ENTER:
          case SPACE:
            if (selectedIndex >= 0 && items[selectedIndex]) {
              // Simulate a click on the selected item
              items[selectedIndex]?.click();
              event.preventDefault();
            }
            break;

          default:
            return;
        }

        if (nextIndex !== currentIndex) {
          onSelect(nextIndex);

          // If virtual focus management is not being used, focus the item
          if (!virtual && items[nextIndex]) {
            items[nextIndex]?.focus();
          }
        }
      },
      [selectedIndex, onSelect, orientation, loop, dir, disabled, virtual],
    );

    return (
      <SelectableContext.Provider value={contextValue}>
        <RootSlot
          role="listbox"
          data-slot="selectable-list"
          data-orientation={orientation}
          data-disabled={disabled ? "" : undefined}
          {...rootProps}
          ref={forwardedRef}
          onKeyDown={composeEventHandlers(rootProps.onKeyDown, onKeyDown)}
          className={cn(
            "focus-visible:outline-none",
            orientation === "horizontal" && "flex items-center gap-2",
            orientation === "vertical" && "flex flex-col gap-2",
            className,
          )}
        />
      </SelectableContext.Provider>
    );
  },
);
SelectableRoot.displayName = SELECTABLE_NAME;

type ItemElement = React.ComponentRef<typeof SelectableItem>;

interface SelectableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  asChild?: boolean;
}

const SelectableItem = React.forwardRef<HTMLDivElement, SelectableItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, index, ...itemProps } = props;
    const context = useSelectableContext(SELECTABLE_ITEM_NAME);
    const ItemSlot = asChild ? Slot : "div";
    const itemRef = React.useRef<ItemElement>(null);
    const composedRef = useComposedRefs(itemRef, forwardedRef);

    const isSelected = context.selectedIndex === index;

    React.useEffect(() => {
      if (itemRef.current) {
        context.collectionRef.current[index] = itemRef.current;

        return () => {
          context.collectionRef.current[index] = null;
        };
      }
    }, [context.collectionRef, index]);

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="selectable-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={context.disabled ? "" : undefined}
        tabIndex={isSelected && !context.disabled ? 0 : -1}
        {...itemProps}
        ref={composedRef}
        onClick={composeEventHandlers(itemProps.onClick, () => {
          if (!context.disabled) {
            context.onSelect(index);
          }
        })}
        className={cn(
          "cursor-default select-none ring-1 ring-transparent focus-visible:outline-none",
          "data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:ring-ring",
          className,
        )}
      />
    );
  },
);
SelectableItem.displayName = SELECTABLE_ITEM_NAME;

const Selectable = SelectableRoot;
const Root = SelectableRoot;
const Item = SelectableItem;

export {
  Selectable,
  SelectableItem,
  //
  Root,
  Item,
};
