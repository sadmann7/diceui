"use client";

import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import type { SelectItem } from "@radix-ui/react-select";
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

interface SelectableState {
  selectedValues: Set<string>;
  focusedValue: string | null;
}

interface SelectableStore {
  state: SelectableState;
  listeners: Set<() => void>;
  subscribe: (callback: () => void) => () => void;
  setSelectedState: (value: string, multiple?: boolean) => void;
  clearSelection: () => void;
  setFocusedState: (value: string | null) => void;
  getState: () => SelectableState;
  isSelected: (value: string) => boolean;
}

function createSelectableStore(
  initialValue: string | null = null,
): SelectableStore {
  return {
    state: {
      selectedValues: initialValue ? new Set([initialValue]) : new Set(),
      focusedValue: null,
    },
    listeners: new Set<() => void>(),
    subscribe(callback: () => void) {
      this.listeners.add(callback);
      return () => {
        this.listeners.delete(callback);
      };
    },
    setSelectedState(value: string, multiple = false) {
      const newSelectedValues = new Set(this.state.selectedValues);

      if (multiple) {
        // Toggle selection in multiple mode
        if (newSelectedValues.has(value)) {
          newSelectedValues.delete(value);
        } else {
          newSelectedValues.add(value);
        }
      } else {
        // Single selection mode
        if (newSelectedValues.size === 1 && newSelectedValues.has(value)) {
          // Deselect if already selected
          newSelectedValues.clear();
        } else {
          // Select only this item
          newSelectedValues.clear();
          newSelectedValues.add(value);
        }
      }

      // Check if the selection has actually changed
      const hasChanged =
        this.state.selectedValues.size !== newSelectedValues.size ||
        ![...newSelectedValues].every((v) => this.state.selectedValues.has(v));

      if (hasChanged) {
        this.state.selectedValues = newSelectedValues;
        for (const listener of this.listeners) {
          listener();
        }
      }
    },
    clearSelection() {
      if (this.state.selectedValues.size > 0) {
        this.state.selectedValues.clear();
        for (const listener of this.listeners) {
          listener();
        }
      }
    },
    setFocusedState(value: string | null) {
      if (this.state.focusedValue !== value) {
        this.state.focusedValue = value;
        for (const listener of this.listeners) {
          listener();
        }
      }
    },
    getState() {
      return this.state;
    },
    isSelected(value: string) {
      return this.state.selectedValues.has(value);
    },
  };
}

function useSelectableState<T>(
  store: SelectableStore,
  selector: (state: SelectableState) => T,
): T {
  const [state, setState] = React.useState(() => selector(store.getState()));

  React.useEffect(() => {
    function callback() {
      const nextState = selector(store.getState());
      setState(nextState);
    }

    const unsubscribe = store.subscribe(callback);
    return unsubscribe;
  }, [store, selector]);

  return state;
}

type ItemElement = React.ComponentRef<typeof SelectItem>;

interface ItemData {
  value: string;
  disabled?: boolean;
}

interface CollectionItem extends ItemData {
  ref: React.RefObject<ItemElement | null>;
}

type CollectionItemMap = Map<
  React.RefObject<ItemElement | null>,
  CollectionItem
>;

function useCollection() {
  const collectionRef = React.useRef<ItemElement | null>(null);
  const itemMap = React.useRef<CollectionItemMap>(new Map()).current;

  const getItems = React.useCallback(() => {
    const collectionNode = collectionRef.current;
    if (!collectionNode) return [];

    const items = Array.from(itemMap.values());

    if (items.length === 0) return [];

    return items.sort((a, b) => {
      if (!a?.ref.current || !b?.ref.current) return 0;
      return a.ref.current.compareDocumentPosition(b.ref.current) &
        Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1;
    });
  }, [itemMap]);

  const onItemRegister = React.useCallback(
    (item: CollectionItem) => {
      itemMap.set(item.ref, item);

      return () => {
        itemMap.delete(item.ref);
      };
    },
    [itemMap],
  );

  return {
    collectionRef,
    itemMap,
    getItems,
    onItemRegister,
  };
}

const itemSelectedSelector = (itemValue: string) => (state: SelectableState) =>
  state.selectedValues.has(itemValue);

const itemFocusedSelector = (itemValue: string) => (state: SelectableState) =>
  state.focusedValue === itemValue;

interface SelectableContextValue {
  store: SelectableStore;
  onItemRegister: (item: CollectionItem) => () => void;
  onItemSelect: (value: string, isMultipleEvent?: boolean) => void;
  onItemFocus: (value: string) => void;
  onItemBlur: () => void;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  multiple?: boolean;
  getItems: () => CollectionItem[];
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
  defaultSelectedValue?: string;
  defaultSelectedValues?: string[];
  selectedValue?: string;
  selectedValues?: string[];
  onSelectedValueChange?: (value: string) => void;
  onSelectedValuesChange?: (values: string[]) => void;
  multiple?: boolean;
  orientation?: "horizontal" | "vertical" | "mixed";
  loop?: boolean;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  virtual?: boolean;
  asChild?: boolean;
}

function findEnabledItem(
  items: CollectionItem[],
  {
    startingIndex,
    decrement = false,
    loop = false,
  }: {
    startingIndex: number;
    decrement?: boolean;
    loop?: boolean;
  },
): CollectionItem | null {
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

    const item = items[index];

    if (item && !item.disabled) {
      return item;
    }
  } while (index !== startingIndex);

  return items[startingIndex] ?? null;
}

function getMinItemValue(items: CollectionItem[]): string | null {
  for (const item of items) {
    if (!item.disabled) {
      return item.value;
    }
  }

  return items[0]?.value ?? null;
}

function getMaxItemValue(items: CollectionItem[]): string | null {
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item && !item.disabled) {
      return item.value;
    }
  }

  return items[items.length - 1]?.value ?? null;
}

const SelectableRoot = React.forwardRef<HTMLDivElement, SelectableRootProps>(
  (props, forwardedRef) => {
    const {
      defaultSelectedValue = null,
      defaultSelectedValues,
      selectedValue: selectedValueProp,
      selectedValues: selectedValuesProp,
      onSelectedValueChange,
      onSelectedValuesChange,
      multiple = false,
      orientation = "vertical",
      loop = false,
      dir = "ltr",
      disabled = false,
      virtual = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const storeRef = React.useRef<SelectableStore | null>(null);
    if (storeRef.current === null) {
      storeRef.current = createSelectableStore(defaultSelectedValue);

      // Initialize with defaultSelectedValues if provided and multiple is true
      if (multiple && defaultSelectedValues?.length) {
        const store = storeRef.current;
        for (const value of defaultSelectedValues) {
          store.setSelectedState(value, true);
        }
      }
    }
    const store = storeRef.current;

    const isControlled =
      selectedValueProp !== undefined || selectedValuesProp !== undefined;

    const lastFocusedValueRef = React.useRef<string | null>(null);

    React.useEffect(() => {
      if (isControlled) {
        if (multiple && selectedValuesProp) {
          // Clear current selection
          store.clearSelection();

          // Add each value from the array
          for (const value of selectedValuesProp) {
            if (value) store.setSelectedState(value, true);
          }
        } else if (
          selectedValueProp !== undefined &&
          selectedValueProp !==
            store.getState().selectedValues.values().next().value
        ) {
          store.clearSelection();
          if (selectedValueProp) {
            store.setSelectedState(selectedValueProp);
          }

          if (selectedValueProp === null || selectedValueProp === "") {
            lastFocusedValueRef.current = null;
          }
        }
      }
    }, [isControlled, selectedValueProp, selectedValuesProp, store, multiple]);

    const { collectionRef, getItems, onItemRegister } = useCollection();
    const composedRef = useComposedRefs(collectionRef, forwardedRef);

    const onItemSelect = React.useCallback(
      (value: string, isMultipleEvent = false) => {
        if (!isControlled) {
          store.setSelectedState(value, multiple && isMultipleEvent);
        }

        if (multiple) {
          // Ensure we get the latest state after the update
          setTimeout(() => {
            const newValues = [...store.getState().selectedValues];
            onSelectedValuesChange?.(newValues);
          }, 0);
        } else {
          onSelectedValueChange?.(value);
        }
      },
      [
        isControlled,
        onSelectedValueChange,
        onSelectedValuesChange,
        store,
        multiple,
      ],
    );

    const onItemFocus = React.useCallback(
      (value: string) => {
        store.setFocusedState(value);
        lastFocusedValueRef.current = value;
      },
      [store],
    );

    const onItemBlur = React.useCallback(() => {
      store.setFocusedState(null);
    }, [store]);

    const focusItemByValue = React.useCallback(
      (value: string) => {
        const items = getItems();
        const item = items.find((item) => item.value === value);
        if (item?.ref.current && !virtual && !item.disabled) {
          item.ref.current?.focus();
          store.setFocusedState(value);
        }
      },
      [getItems, store, virtual],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (disabled) return;

        const isRtl = dir === "rtl";
        const isVertical =
          orientation === "vertical" || orientation === "mixed";
        const isHorizontal =
          orientation === "horizontal" || orientation === "mixed";

        const items = getItems().filter((item) => !item.disabled);
        const itemCount = items.length;

        if (itemCount === 0) return;

        // Use focusedValue for navigation instead of selectedValue
        const focusedValue = store.getState().focusedValue;
        const currentIndex = focusedValue
          ? items.findIndex((item) => item.value === focusedValue)
          : -1;

        let nextItem: CollectionItem | null = null;

        let columnCount = 1;
        let rowCount = itemCount;

        if (orientation === "mixed" && event.currentTarget) {
          const itemElements = items
            .map((item) => item.ref.current)
            .filter(Boolean) as ItemElement[];

          if (itemElements.length > 1) {
            const rect1 = itemElements[0]?.getBoundingClientRect();
            const rect2 = itemElements[1]?.getBoundingClientRect();

            if (rect1 && rect2) {
              const sameRow = Math.abs(rect1.top - rect2.top) < 10;

              if (sameRow) {
                const firstRowY = rect1.top;
                let colCount = 0;

                for (const itemElement of itemElements) {
                  const rect = itemElement.getBoundingClientRect();
                  if (Math.abs(rect.top - firstRowY) < 10) {
                    colCount++;
                  } else {
                    break;
                  }
                }

                columnCount = Math.max(1, colCount);
                rowCount = Math.ceil(itemCount / columnCount);
              }
            }
          }
        }

        if (event.key === "Tab") {
          return;
        }

        switch (event.key) {
          case HOME: {
            const minValue = getMinItemValue(items);
            if (minValue) {
              const minItem =
                items.find((item) => item.value === minValue) ?? null;
              if (minItem?.ref.current && !virtual) {
                minItem.ref.current?.focus();
                store.setFocusedState(minValue);
              }
            }
            event.preventDefault();
            break;
          }

          case END: {
            const maxValue = getMaxItemValue(items);
            if (maxValue) {
              const maxItem =
                items.find((item) => item.value === maxValue) ?? null;
              if (maxItem?.ref.current && !virtual) {
                maxItem.ref.current?.focus();
                store.setFocusedState(maxValue);
              }
            }
            event.preventDefault();
            break;
          }

          case ARROW_UP:
            if (isVertical) {
              if (
                orientation === "mixed" &&
                columnCount > 1 &&
                currentIndex >= 0
              ) {
                const currentCol = currentIndex % columnCount;
                const targetIndex = currentIndex - columnCount;

                if (targetIndex >= 0) {
                  nextItem = items[targetIndex] ?? null;
                } else if (loop) {
                  const lastRowItemIndex =
                    currentCol + (rowCount - 1) * columnCount;
                  const targetIndex = Math.min(lastRowItemIndex, itemCount - 1);
                  nextItem = items[targetIndex] ?? null;
                }
              } else if (currentIndex >= 0) {
                nextItem = findEnabledItem(items, {
                  startingIndex: currentIndex,
                  decrement: true,
                  loop,
                });
              } else if (items.length > 0) {
                nextItem = items[0] || null;
              }
              event.preventDefault();
            }
            break;

          case ARROW_DOWN:
            if (isVertical) {
              if (
                orientation === "mixed" &&
                columnCount > 1 &&
                currentIndex >= 0
              ) {
                const currentCol = currentIndex % columnCount;
                const targetIndex = currentIndex + columnCount;

                if (targetIndex < itemCount) {
                  nextItem = items[targetIndex] ?? null;
                } else if (loop) {
                  nextItem = items[currentCol] ?? null;
                }
              } else if (currentIndex >= 0) {
                nextItem = findEnabledItem(items, {
                  startingIndex: currentIndex,
                  loop,
                });
              } else if (items.length > 0) {
                nextItem = items[0] ?? null;
              }
              event.preventDefault();
            }
            break;

          case ARROW_LEFT:
            if (isHorizontal && currentIndex >= 0) {
              nextItem = findEnabledItem(items, {
                startingIndex: currentIndex,
                decrement: !isRtl,
                loop,
              });
              event.preventDefault();
            } else if (isHorizontal && items.length > 0) {
              nextItem = items[0] ?? null;
              event.preventDefault();
            }
            break;

          case ARROW_RIGHT:
            if (isHorizontal && currentIndex >= 0) {
              nextItem = findEnabledItem(items, {
                startingIndex: currentIndex,
                decrement: isRtl,
                loop,
              });
              event.preventDefault();
            } else if (isHorizontal && items.length > 0) {
              nextItem = items[0] ?? null;
              event.preventDefault();
            }
            break;

          case ENTER:
          case SPACE:
            if (focusedValue) {
              // Toggle selection of the focused item
              // Use the same multiple selection logic as in onClick
              const isMultipleSelectionKey =
                multiple &&
                (multiple === true || event.ctrlKey || event.metaKey);

              onItemSelect(focusedValue, isMultipleSelectionKey);
              event.preventDefault();
            }
            break;

          default:
            return;
        }

        if (nextItem) {
          // Only update focus, not selection
          if (!virtual && nextItem.ref.current) {
            nextItem.ref.current?.focus();
            store.setFocusedState(nextItem.value);
            // Don't select on arrow navigation
            // onItemSelect(nextItem.value);
          }
        }
      },
      [
        dir,
        orientation,
        store,
        onItemSelect,
        getItems,
        disabled,
        loop,
        virtual,
        multiple,
      ],
    );

    const onFocus = React.useCallback(
      (event: React.FocusEvent) => {
        if (event.target === event.currentTarget) {
          const focusedValue = store.getState().focusedValue;
          const items = getItems().filter((item) => !item.disabled);

          if (lastFocusedValueRef.current) {
            const itemExists = items.some(
              (item) => item.value === lastFocusedValueRef.current,
            );

            if (itemExists) {
              focusItemByValue(lastFocusedValueRef.current);
              // Remove selection on tab focus
              // onItemSelect(lastFocusedValueRef.current);
            } else {
              lastFocusedValueRef.current = null;
              // Only focus the first item, don't select it
              const firstItem = items[0];
              if (firstItem?.ref.current && !virtual) {
                firstItem.ref.current?.focus();
                store.setFocusedState(firstItem.value);
              }
            }
          } else if (focusedValue) {
            const itemExists = items.some(
              (item) => item.value === focusedValue,
            );

            if (itemExists) {
              focusItemByValue(focusedValue);
            } else {
              // Only focus the first item, don't select it
              const firstItem = items[0];
              if (firstItem?.ref.current && !virtual) {
                firstItem.ref.current?.focus();
                store.setFocusedState(firstItem.value);
              }
            }
          } else {
            // Only focus the first item, don't select it
            const firstItem = items[0];
            if (firstItem?.ref.current && !virtual) {
              firstItem.ref.current?.focus();
              store.setFocusedState(firstItem.value);
            }
          }
        }
      },
      [focusItemByValue, store, getItems, virtual],
    );

    const contextValue = React.useMemo<SelectableContextValue>(
      () => ({
        dir,
        orientation,
        store,
        onItemRegister,
        onItemSelect,
        onItemFocus,
        onItemBlur,
        getItems,
        disabled,
        loop,
        virtual,
        multiple,
      }),
      [
        dir,
        orientation,
        store,
        onItemRegister,
        onItemSelect,
        onItemFocus,
        onItemBlur,
        getItems,
        disabled,
        loop,
        virtual,
        multiple,
      ],
    );

    const RootSlot = asChild ? Slot : "div";

    return (
      <SelectableContext.Provider value={contextValue}>
        <RootSlot
          role="listbox"
          aria-multiselectable={multiple ? "true" : undefined}
          data-orientation={orientation}
          data-slot="selectable"
          tabIndex={0}
          {...rootProps}
          ref={composedRef}
          onKeyDown={composeEventHandlers(rootProps.onKeyDown, onKeyDown)}
          onFocus={composeEventHandlers(rootProps.onFocus, onFocus)}
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

    const id = React.useId();
    const itemValue = value ?? id;

    const isSelected = useSelectableState(
      context.store,
      React.useCallback(itemSelectedSelector(itemValue), []),
    );
    const isFocused = useSelectableState(
      context.store,
      React.useCallback(itemFocusedSelector(itemValue), []),
    );
    const isDisabled = disabled || context.disabled;

    useIsomorphicLayoutEffect(() => {
      return context.onItemRegister({
        ref: itemRef,
        value: itemValue,
        disabled: isDisabled,
      });
    }, [context.onItemRegister, itemValue, isDisabled]);

    const onFocus = React.useCallback(() => {
      if (!isDisabled) {
        context.onItemFocus(itemValue);
      }
    }, [context, isDisabled, itemValue]);

    const onBlur = React.useCallback(() => {
      context.onItemBlur();
    }, [context]);

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (!isDisabled) {
          const isMultipleSelectionKey =
            context.multiple &&
            (context.multiple === true || event.ctrlKey || event.metaKey);

          context.onItemSelect(itemValue, isMultipleSelectionKey);
        }
      },
      [context, isDisabled, itemValue],
    );

    const ItemSlot = asChild ? Slot : "div";

    return (
      <ItemSlot
        role="option"
        aria-selected={isSelected}
        data-slot="selectable-item"
        data-selected={isSelected ? "" : undefined}
        data-highlighted={isFocused ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        tabIndex={isDisabled ? undefined : isFocused ? 0 : -1}
        {...itemProps}
        ref={composedRef}
        onClick={composeEventHandlers(itemProps.onClick, onClick)}
        onFocus={composeEventHandlers(itemProps.onFocus, onFocus)}
        onBlur={composeEventHandlers(itemProps.onBlur, onBlur)}
        className={cn(
          "cursor-default select-none ring-1 ring-transparent focus-visible:outline-none focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-selected:ring-ring",
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
