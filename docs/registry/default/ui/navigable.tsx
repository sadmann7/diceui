"use client";

import { composeEventHandlers } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const LIST_NAME = "NavigableList";
const ITEM_NAME = "NavigableItem";

const NAVIGABLE_ERROR = {
  [LIST_NAME]: `\`${LIST_NAME}\` must be used as root component`,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${LIST_NAME}\``,
} as const;

interface NavigableContextValue {
  id: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
}

const NavigableContext = React.createContext<NavigableContextValue | null>(
  null,
);
NavigableContext.displayName = LIST_NAME;

function useNavigableContext(name: keyof typeof NAVIGABLE_ERROR) {
  const context = React.useContext(NavigableContext);
  if (!context) {
    throw new Error(NAVIGABLE_ERROR[name]);
  }
  return context;
}

interface NavigableListProps extends React.ComponentPropsWithoutRef<"div"> {
  id?: string;
  defaultSelectedIndex?: number;
  selectedIndex?: number;
  onSelectedIndexChange?: (index: number) => void;
  orientation?: "horizontal" | "vertical" | "both";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  asChild?: boolean;
}

const NavigableList = React.forwardRef<HTMLDivElement, NavigableListProps>(
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
      ...listProps
    } = props;

    const [uncontrolledSelectedIndex, setUncontrolledSelectedIndex] =
      React.useState(defaultSelectedIndex);

    const selectedIndex = selectedIndexProp ?? uncontrolledSelectedIndex;
    const isControlled = selectedIndexProp !== undefined;

    const onSelect = React.useCallback(
      (index: number) => {
        if (!isControlled) {
          setUncontrolledSelectedIndex(index);
        }
        onSelectedIndexChange?.(index);
      },
      [isControlled, onSelectedIndexChange],
    );

    const contextValue = React.useMemo<NavigableContextValue>(
      () => ({
        id,
        selectedIndex,
        onSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
      }),
      [id, selectedIndex, onSelect, orientation, loop, dir, disabled, virtual],
    );

    const ListSlot = asChild ? Slot : "div";

    const itemCount = React.useMemo(
      () => React.Children.count(props.children),
      [props.children],
    );
    const columnCount = React.useMemo(
      () =>
        orientation === "horizontal"
          ? itemCount
          : Math.ceil(Math.sqrt(itemCount)),
      [orientation, itemCount],
    );

    const getNextIndex = React.useCallback(
      (currentIndex: number, key: string): number => {
        if (orientation === "both") {
          const currentRow = Math.floor(currentIndex / columnCount);

          switch (key) {
            case "ArrowDown": {
              const nextIndex = currentIndex + columnCount;
              return loop
                ? ((nextIndex % itemCount) + itemCount) % itemCount
                : nextIndex >= itemCount
                  ? currentIndex
                  : nextIndex;
            }
            case "ArrowUp": {
              const nextIndex = currentIndex - columnCount;
              return loop
                ? ((nextIndex % itemCount) + itemCount) % itemCount
                : nextIndex < 0
                  ? currentIndex
                  : nextIndex;
            }
            case "ArrowRight": {
              const nextIndex = currentIndex + 1;
              const nextRow = Math.floor(nextIndex / columnCount);
              return nextRow !== currentRow || nextIndex >= itemCount
                ? currentIndex
                : nextIndex;
            }
            case "ArrowLeft": {
              const nextIndex = currentIndex - 1;
              const nextRow = Math.floor(nextIndex / columnCount);
              return nextRow !== currentRow || nextIndex < 0
                ? currentIndex
                : nextIndex;
            }
          }
        }

        return currentIndex;
      },
      [orientation, columnCount, itemCount, loop],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return;

        const isVertical = orientation === "vertical" || orientation === "both";
        const isHorizontal =
          orientation === "horizontal" || orientation === "both";
        const isRtl = dir === "rtl";

        let nextIndex = selectedIndex;

        if (event.key === "Tab") {
          if (selectedIndex === -1) {
            event.preventDefault();
            nextIndex = 0;
          } else {
            nextIndex = -1;
          }
        } else if (orientation === "both") {
          nextIndex = getNextIndex(selectedIndex, event.key);
        } else {
          if (isVertical && event.key === "ArrowDown") {
            event.preventDefault();
            nextIndex = selectedIndex + 1;
          } else if (isVertical && event.key === "ArrowUp") {
            event.preventDefault();
            nextIndex = selectedIndex - 1;
          } else if (
            isHorizontal &&
            event.key === (isRtl ? "ArrowLeft" : "ArrowRight")
          ) {
            event.preventDefault();
            nextIndex = selectedIndex + 1;
          } else if (
            isHorizontal &&
            event.key === (isRtl ? "ArrowRight" : "ArrowLeft")
          ) {
            event.preventDefault();
            nextIndex = selectedIndex - 1;
          } else if (event.key === "Home") {
            event.preventDefault();
            nextIndex = 0;
          } else if (event.key === "End") {
            event.preventDefault();
            nextIndex = itemCount - 1;
          }

          if (loop) {
            nextIndex = ((nextIndex % itemCount) + itemCount) % itemCount;
          } else {
            nextIndex = Math.max(0, Math.min(nextIndex, itemCount - 1));
          }
        }

        if (nextIndex !== selectedIndex) {
          onSelect(nextIndex);
        }
      },
      [
        disabled,
        orientation,
        dir,
        selectedIndex,
        loop,
        itemCount,
        onSelect,
        getNextIndex,
      ],
    );

    return (
      <NavigableContext.Provider value={contextValue}>
        <ListSlot
          role="listbox"
          data-slot="navigable-list"
          data-orientation={orientation}
          data-disabled={disabled ? "" : undefined}
          {...listProps}
          tabIndex={disabled ? undefined : -1}
          ref={forwardedRef}
          onKeyDown={composeEventHandlers(listProps.onKeyDown, onKeyDown)}
          onFocus={composeEventHandlers(listProps.onFocus, () => {
            if (selectedIndex === -1 && !disabled) {
              onSelect(0);
            }
          })}
          className={cn(
            "focus-visible:outline-none",
            orientation === "horizontal" && "flex items-center gap-2",
            orientation === "vertical" && "flex flex-col gap-2",
            orientation === "both" && `grid gap-2 grid-cols-${columnCount}`,
            className,
          )}
        />
      </NavigableContext.Provider>
    );
  },
);
NavigableList.displayName = LIST_NAME;

interface NavigableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  asChild?: boolean;
}

const NavigableItem = React.forwardRef<HTMLDivElement, NavigableItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, index, ...itemProps } = props;
    const context = useNavigableContext(ITEM_NAME);
    const ItemSlot = asChild ? Slot : "div";

    const isSelected = context.selectedIndex === index;

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="navigable-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={context.disabled ? "" : undefined}
        {...itemProps}
        ref={forwardedRef}
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
NavigableItem.displayName = ITEM_NAME;

const List = NavigableList;
const Item = NavigableItem;

export {
  NavigableList,
  NavigableItem,
  //
  List,
  Item,
};
