"use client";

import { composeEventHandlers } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const SELECTABLE_NAME = "Selectable";
const SELECTABLE_ITEM_NAME = "SelectableItem";

const SELECTABLE_ERROR = {
  [SELECTABLE_NAME]: `\`${SELECTABLE_NAME}\` must be used as root component`,
  [SELECTABLE_ITEM_NAME]: `\`${SELECTABLE_ITEM_NAME}\` must be within \`${SELECTABLE_NAME}\``,
} as const;

interface SelectableContextValue {
  selectedIndices: number[];
  onSelect: (indices: number[]) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  multiple?: boolean;
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
  defaultSelectedIndices?: number[];
  selectedIndices?: number[];
  onSelectedIndicesChange?: (indices: number[]) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  multiple?: boolean;
  asChild?: boolean;
}

const SelectableRoot = React.forwardRef<HTMLDivElement, SelectableRootProps>(
  (props, forwardedRef) => {
    const {
      defaultSelectedIndices = [],
      selectedIndices: selectedIndicesProp,
      onSelectedIndicesChange,
      orientation = "vertical",
      loop = false,
      dir = "ltr",
      disabled = false,
      virtual = false,
      multiple = false,
      asChild,
      className,
      ...listProps
    } = props;

    const [uncontrolledSelectedIndices, setUncontrolledSelectedIndices] =
      React.useState(defaultSelectedIndices);

    const selectedIndices = selectedIndicesProp ?? uncontrolledSelectedIndices;
    const isControlled = selectedIndicesProp !== undefined;

    const onSelect = React.useCallback(
      (indices: number[]) => {
        if (!isControlled) {
          setUncontrolledSelectedIndices(indices);
        }
        onSelectedIndicesChange?.(indices);
      },
      [isControlled, onSelectedIndicesChange],
    );

    const contextValue = React.useMemo<SelectableContextValue>(
      () => ({
        selectedIndices,
        onSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
        multiple,
      }),
      [
        selectedIndices,
        onSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
        multiple,
      ],
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
        if (orientation === "mixed") {
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
            default:
              return currentIndex;
          }
        }

        return currentIndex;
      },
      [orientation, columnCount, itemCount, loop],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return;

        const isVertical =
          orientation === "vertical" || orientation === "mixed";
        const isHorizontal =
          orientation === "horizontal" || orientation === "mixed";
        const isRtl = dir === "rtl";

        // Get the last selected index or -1 if none selected
        const lastSelectedIndex: number = selectedIndices.at(-1) ?? -1;

        let nextIndex: number = lastSelectedIndex;

        if (event.key === "Tab") {
          if (lastSelectedIndex === -1) {
            event.preventDefault();
            nextIndex = 0;
          } else {
            nextIndex = -1;
          }
        } else if (orientation === "mixed" && lastSelectedIndex !== -1) {
          nextIndex = getNextIndex(lastSelectedIndex, event.key);
        } else {
          if (isVertical && event.key === "ArrowDown") {
            event.preventDefault();
            nextIndex = Math.max(-1, lastSelectedIndex) + 1;
          } else if (isVertical && event.key === "ArrowUp") {
            event.preventDefault();
            nextIndex = Math.max(-1, lastSelectedIndex) - 1;
          } else if (
            isHorizontal &&
            event.key === (isRtl ? "ArrowLeft" : "ArrowRight")
          ) {
            event.preventDefault();
            nextIndex = Math.max(-1, lastSelectedIndex) + 1;
          } else if (
            isHorizontal &&
            event.key === (isRtl ? "ArrowRight" : "ArrowLeft")
          ) {
            event.preventDefault();
            nextIndex = Math.max(-1, lastSelectedIndex) - 1;
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

        if (nextIndex !== lastSelectedIndex) {
          if (multiple && event.shiftKey) {
            // Add to selection if multiple and shift is pressed
            onSelect([...selectedIndices, nextIndex]);
          } else if (multiple && (event.ctrlKey || event.metaKey)) {
            // Toggle selection if multiple and ctrl/cmd is pressed
            const newIndices = selectedIndices.includes(nextIndex)
              ? selectedIndices.filter((i) => i !== nextIndex)
              : [...selectedIndices, nextIndex];
            onSelect(newIndices);
          } else {
            // Single selection
            onSelect([nextIndex]);
          }
        }
      },
      [
        disabled,
        orientation,
        dir,
        selectedIndices,
        loop,
        itemCount,
        onSelect,
        getNextIndex,
        multiple,
      ],
    );

    return (
      <SelectableContext.Provider value={contextValue}>
        <ListSlot
          role="listbox"
          data-slot="selectable-list"
          data-orientation={orientation}
          data-disabled={disabled ? "" : undefined}
          tabIndex={disabled ? undefined : 0}
          {...listProps}
          ref={forwardedRef}
          onKeyDown={composeEventHandlers(listProps.onKeyDown, onKeyDown)}
          onFocus={composeEventHandlers(listProps.onFocus, () => {
            if (selectedIndices.length === 0 && !disabled) {
              onSelect([0]);
            }
          })}
          className={cn(
            "focus-visible:outline-none",
            orientation === "horizontal" && "flex items-center gap-2",
            orientation === "vertical" && "flex flex-col gap-2",
            orientation === "mixed" && `grid gap-2 grid-cols-${columnCount}`,
            className,
          )}
        />
      </SelectableContext.Provider>
    );
  },
);
SelectableRoot.displayName = SELECTABLE_NAME;

interface SelectableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  index: number;
  asChild?: boolean;
  disabled?: boolean;
}

const SelectableItem = React.forwardRef<HTMLDivElement, SelectableItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, index, ...itemProps } = props;
    const context = useSelectableContext(SELECTABLE_ITEM_NAME);
    const ItemSlot = asChild ? Slot : "div";

    const isSelected = context.selectedIndices.includes(index);

    const isDisabled = context.disabled || itemProps.disabled;

    const onItemSelect = React.useCallback(
      (event: React.MouseEvent) => {
        if (!isDisabled) {
          if (context.multiple && (event.ctrlKey || event.metaKey)) {
            // Toggle selection if multiple and ctrl/cmd is pressed
            const newIndices = context.selectedIndices.includes(index)
              ? context.selectedIndices.filter((i) => i !== index)
              : [...context.selectedIndices, index];
            context.onSelect(newIndices);
          } else if (context.multiple && event.shiftKey) {
            // Add to selection if multiple and shift is pressed
            context.onSelect([...context.selectedIndices, index]);
          } else {
            // Single selection
            context.onSelect([index]);
          }
        }
      },
      [
        context.onSelect,
        context.selectedIndices,
        index,
        context.multiple,
        isDisabled,
      ],
    );

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="selectable-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        {...itemProps}
        ref={forwardedRef}
        onClick={composeEventHandlers(itemProps.onClick, onItemSelect)}
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
