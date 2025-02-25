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
  selectedValue: string | null;
  registerItem: (id: string, element: ItemElement | null) => () => void;
  onValueSelect: (value: string) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  collectionRef: React.RefObject<Map<string, ItemElement | null>>;
  itemsRef: React.RefObject<string[]>;
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
  defaultSelectedValue?: string;
  selectedValue?: string;
  onSelectedValueChange?: (value: string) => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  asChild?: boolean;
}

function findEnabledItem(
  itemsRef: React.RefObject<string[]>,
  {
    startingIndex,
    disabledIds = new Set<string>(),
    decrement = false,
    loop = false,
  }: {
    startingIndex: number;
    disabledIds?: Set<string>;
    decrement?: boolean;
    loop?: boolean;
  },
): string | null {
  const items = itemsRef.current || [];
  const len = items.length;
  let index = startingIndex;

  do {
    index = decrement ? index - 1 : index + 1;

    if (loop) {
      if (index < 0) {
        index = len - 1;
      } else if (index >= len) {
        index = 0;
      }
    } else {
      if (index < 0 || index >= len) {
        return items[decrement ? 0 : len - 1] ?? null;
      }
    }

    const itemId = items[index];

    if (itemId && !disabledIds.has(itemId)) {
      return itemId;
    }
  } while (index !== startingIndex);

  return items[startingIndex] ?? null;
}

function getMinItemValue(
  itemsRef: React.RefObject<string[]>,
  disabledIds?: Set<string>,
): string | null {
  const items = itemsRef.current ?? [];

  for (const itemId of items) {
    if (!disabledIds?.has(itemId)) {
      return itemId;
    }
  }

  return items[0] ?? null;
}

function getMaxItemValue(
  itemsRef: React.RefObject<string[]>,
  disabledIds?: Set<string>,
): string | null {
  const items = itemsRef.current ?? [];

  for (let i = items.length - 1; i >= 0; i--) {
    const itemId = items[i];
    if (itemId && !disabledIds?.has(itemId)) {
      return itemId;
    }
  }

  return items[items.length - 1] || null;
}

const SelectableRoot = React.forwardRef<HTMLDivElement, SelectableRootProps>(
  (props, forwardedRef) => {
    const {
      id = React.useId(),
      defaultSelectedValue = null,
      selectedValue: selectedValueProp,
      onSelectedValueChange,
      orientation = "vertical",
      loop = false,
      dir = "ltr",
      disabled = false,
      virtual = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const [uncontrolledSelectedValue, setUncontrolledSelectedValue] =
      React.useState<string | null>(defaultSelectedValue);

    const selectedValue =
      selectedValueProp !== undefined
        ? selectedValueProp
        : uncontrolledSelectedValue;
    const isControlled = selectedValueProp !== undefined;

    const collectionRef = React.useRef<Map<string, ItemElement | null>>(
      new Map(),
    );

    const itemsRef = React.useRef<string[]>([]);

    const onValueSelect = React.useCallback(
      (value: string) => {
        if (!isControlled) {
          setUncontrolledSelectedValue(value);
        }
        onSelectedValueChange?.(value);
      },
      [isControlled, onSelectedValueChange],
    );

    const registerItem = React.useCallback(
      (id: string, element: ItemElement | null) => {
        collectionRef.current.set(id, element);

        if (!itemsRef.current.includes(id)) {
          itemsRef.current.push(id);
        }

        return () => {
          collectionRef.current.delete(id);
          itemsRef.current = itemsRef.current.filter((itemId) => itemId !== id);
        };
      },
      [],
    );

    const contextValue = React.useMemo<SelectableContextValue>(
      () => ({
        id,
        selectedValue,
        registerItem,
        onValueSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
        collectionRef,
        itemsRef,
      }),
      [
        id,
        selectedValue,
        registerItem,
        onValueSelect,
        orientation,
        loop,
        dir,
        disabled,
        virtual,
      ],
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

        const items = itemsRef.current;
        const itemCount = items.length;

        if (itemCount === 0) return;

        const currentIndex = selectedValue ? items.indexOf(selectedValue) : 0;
        let nextItemValue: string | null = null;

        switch (event.key) {
          case HOME:
            nextItemValue = getMinItemValue(itemsRef);
            event.preventDefault();
            break;

          case END:
            nextItemValue = getMaxItemValue(itemsRef);
            event.preventDefault();
            break;

          case ARROW_UP:
            if (isVertical) {
              nextItemValue = findEnabledItem(itemsRef, {
                startingIndex: currentIndex,
                decrement: true,
                loop,
              });
              event.preventDefault();
            }
            break;

          case ARROW_DOWN:
            if (isVertical) {
              nextItemValue = findEnabledItem(itemsRef, {
                startingIndex: currentIndex,
                loop,
              });
              event.preventDefault();
            }
            break;

          case ARROW_LEFT:
            if (isHorizontal) {
              nextItemValue = findEnabledItem(itemsRef, {
                startingIndex: currentIndex,
                decrement: !isRtl,
                loop,
              });
              event.preventDefault();
            }
            break;

          case ARROW_RIGHT:
            if (isHorizontal) {
              nextItemValue = findEnabledItem(itemsRef, {
                startingIndex: currentIndex,
                decrement: isRtl,
                loop,
              });
              event.preventDefault();
            }
            break;

          case ENTER:
          case SPACE:
            if (selectedValue) {
              // Simulate a click on the selected item
              const element = collectionRef.current.get(selectedValue);
              element?.click();
              event.preventDefault();
            }
            break;

          default:
            return;
        }

        if (nextItemValue && nextItemValue !== selectedValue) {
          onValueSelect(nextItemValue);

          // If virtual focus management is not being used, focus the item
          if (!virtual) {
            const element = collectionRef.current.get(nextItemValue);
            element?.focus();
          }
        }
      },
      [selectedValue, onValueSelect, orientation, loop, dir, disabled, virtual],
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

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ItemElement = HTMLDivElement;

interface SelectableItemProps extends React.ComponentPropsWithoutRef<"div"> {
  value?: string;
  disabled?: boolean;
  asChild?: boolean;
}

const SelectableItem = React.forwardRef<HTMLDivElement, SelectableItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, value, disabled = false, ...itemProps } = props;
    const context = useSelectableContext(SELECTABLE_ITEM_NAME);
    const itemRef = React.useRef<ItemElement>(null);
    const composedRef = useComposedRefs(itemRef, forwardedRef);
    const ItemSlot = asChild ? Slot : "div";

    const id = React.useId();
    const itemValue = value ?? id;

    const isSelected = context.selectedValue === itemValue;
    const isDisabled = context.disabled || disabled;

    useIsomorphicLayoutEffect(() => {
      return context.registerItem(itemValue, itemRef.current);
    }, [context.registerItem, itemValue]);

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="selectable-item"
        data-selected={isSelected ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        tabIndex={isDisabled ? undefined : -1}
        {...itemProps}
        ref={composedRef}
        onClick={composeEventHandlers(itemProps.onClick, () => {
          if (!isDisabled) {
            context.onValueSelect(itemValue);
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
