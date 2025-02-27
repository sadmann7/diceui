"use client";

import { useControllableState } from "@/hooks/use-controllable-state";
import { composeEventHandlers, useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import type { SelectItem } from "@radix-ui/react-select";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const SELECTABLE_NAME = "Selectable";
const SELECTABLE_ITEM_NAME = "SelectableItem";

const SELECTABLE_ERROR = {
  [SELECTABLE_NAME]: `\`${SELECTABLE_NAME}\` must be used as root component`,
  [SELECTABLE_ITEM_NAME]: `\`${SELECTABLE_ITEM_NAME}\` must be within \`${SELECTABLE_NAME}\``,
} as const;

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

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
  defaultValue: string | null = null,
): SelectableStore {
  const store: SelectableStore = {
    state: {
      selectedValues: defaultValue
        ? new Set<string>([defaultValue])
        : new Set<string>(),
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
        if (newSelectedValues.has(value)) {
          newSelectedValues.delete(value);
        } else {
          newSelectedValues.add(value);
        }
      } else {
        if (newSelectedValues.size === 1 && newSelectedValues.has(value)) {
          newSelectedValues.clear();
        } else {
          newSelectedValues.clear();
          newSelectedValues.add(value);
        }
      }

      const hasChanged =
        this.state.selectedValues.size !== newSelectedValues.size ||
        ![...newSelectedValues].every((v) => this.state.selectedValues.has(v));

      if (hasChanged) {
        this.state = {
          ...this.state,
          selectedValues: newSelectedValues,
        };

        queueMicrotask(() => {
          for (const listener of this.listeners) {
            listener();
          }
        });
      }
    },
    clearSelection() {
      if (this.state.selectedValues.size > 0) {
        this.state = {
          ...this.state,
          selectedValues: new Set<string>(),
        };

        queueMicrotask(() => {
          for (const listener of this.listeners) {
            listener();
          }
        });
      }
    },
    setFocusedState(value: string | null) {
      if (this.state.focusedValue !== value) {
        this.state = {
          ...this.state,
          focusedValue: value,
        };

        queueMicrotask(() => {
          for (const listener of this.listeners) {
            listener();
          }
        });
      }
    },
    getState() {
      return this.state;
    },
    isSelected(value: string) {
      return this.state.selectedValues.has(value);
    },
  };

  return store;
}

function useSelectableState<T>(selector: (state: SelectableState) => T): T {
  const store = useSelectableContext(SELECTABLE_NAME).store;

  const subscribe = React.useCallback(
    (callback: () => void) => {
      return store.subscribe(callback);
    },
    [store],
  );

  const getSnapshot = React.useCallback(() => {
    return selector(store.getState());
  }, [store, selector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

type RootElement = React.ComponentRef<typeof SelectableRoot>;
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
  const collectionRef = React.useRef<RootElement | null>(null);
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

      return () => itemMap.delete(item.ref);
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

interface SelectableContextValue {
  store: SelectableStore;
  onItemRegister: (item: CollectionItem) => () => void;
  onItemSelect: (value: string, isMultipleEvent?: boolean) => void;
  onItemFocus: (value: string) => void;
  onItemBlur: () => void;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
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

function calculateGridLayout(
  items: CollectionItem[],
  orientation: string,
): { columnCount: number; rowCount: number } {
  if (orientation !== "mixed" || items.length <= 1) {
    return { columnCount: 1, rowCount: items.length };
  }

  const itemElements = items
    .map((item) => item.ref.current)
    .filter(Boolean) as ItemElement[];

  if (itemElements.length <= 1) {
    return { columnCount: 1, rowCount: items.length };
  }

  const rect1 = itemElements[0]?.getBoundingClientRect();
  const rect2 = itemElements[1]?.getBoundingClientRect();

  if (!rect1 || !rect2) {
    return { columnCount: 1, rowCount: items.length };
  }

  const sameRow = Math.abs(rect1.top - rect2.top) < 10;
  if (!sameRow) {
    return { columnCount: 1, rowCount: items.length };
  }

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

  const columnCount = Math.max(1, colCount);
  const rowCount = Math.ceil(items.length / columnCount);

  return { columnCount, rowCount };
}

interface SelectableRootProps<Multiple extends boolean = false>
  extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: Value<Multiple>;
  value?: Value<Multiple>;
  onValueChange?: (value: Value<Multiple>) => void;
  dir?: "ltr" | "rtl";
  disabled?: boolean;
  loop?: boolean;
  multiple?: Multiple;
  orientation?: "horizontal" | "vertical" | "mixed";
  virtual?: boolean;
  asChild?: boolean;
}

function SelectableRootImpl<Multiple extends boolean = false>(
  props: SelectableRootProps<Multiple>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    defaultValue,
    value: valueProp,
    onValueChange,
    dir = "ltr",
    disabled = false,
    loop = false,
    multiple = false as Multiple,
    orientation = "vertical",
    virtual = false,
    asChild,
    className,
    ...rootProps
  } = props;

  const storeRef = React.useRef<SelectableStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createSelectableStore(
      typeof defaultValue === "string" ? defaultValue : null,
    );

    if (multiple && Array.isArray(defaultValue) && defaultValue.length) {
      const store = storeRef.current;
      for (const val of defaultValue) {
        if (val) store.setSelectedState(val, true);
      }
    }
  }
  const store = storeRef.current;

  const lastFocusedValueRef = React.useRef<string | null>(null);

  const onFocusedValueChange = React.useCallback((value: string | null) => {
    lastFocusedValueRef.current = value;
  }, []);

  const [value, setValue] = useControllableState<Value<Multiple>>({
    prop: valueProp,
    defaultProp: defaultValue,
    onChange: onValueChange,
  });

  React.useEffect(() => {
    if (value !== undefined) {
      if (multiple && Array.isArray(value)) {
        const currentSelectedValues = store.getState().selectedValues;
        const currentSelectedArray = [...currentSelectedValues];

        const needsUpdate =
          value.length !== currentSelectedArray.length ||
          !value.every((val) => currentSelectedValues.has(val)) ||
          !currentSelectedArray.every((val) => value.includes(val));

        if (needsUpdate) {
          store.clearSelection();
          for (const val of value) {
            if (val) store.setSelectedState(val, true);
          }
        }
      } else if (
        typeof value === "string" &&
        value !== store.getState().selectedValues.values().next().value
      ) {
        if (value) {
          store.setSelectedState(value);
        }
      }
    }
  }, [value, store, multiple]);

  const { collectionRef, getItems, onItemRegister } = useCollection();

  const isShiftTabRef = React.useRef(false);
  const composedRef = useComposedRefs(collectionRef, forwardedRef);

  const onItemSelect = React.useCallback(
    (itemValue: string, isMultipleEvent = false) => {
      if (multiple) {
        if (isMultipleEvent) {
          const currentValues = new Set(
            Array.isArray(value) ? value : value ? [value] : [],
          );

          if (currentValues.has(itemValue)) {
            currentValues.delete(itemValue);
          } else {
            currentValues.add(itemValue);
            onFocusedValueChange(itemValue);
          }

          setValue([...currentValues] as Value<Multiple>);
        } else {
          setValue([itemValue] as Value<Multiple>);
          onFocusedValueChange(itemValue);
        }
      } else {
        if (value === itemValue) {
          setValue("" as Value<Multiple>);
        } else {
          setValue(itemValue as Value<Multiple>);
          onFocusedValueChange(itemValue);
        }
      }

      store.setSelectedState(itemValue, multiple && isMultipleEvent);
    },
    [value, setValue, store, multiple, onFocusedValueChange],
  );

  const onItemFocus = React.useCallback(
    (value: string) => {
      store.setFocusedState(value);
      onFocusedValueChange(value);
    },
    [store, onFocusedValueChange],
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
        onFocusedValueChange(value);
      }
    },
    [getItems, store, virtual, onFocusedValueChange],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      if (disabled) return;

      if (event.key === "Tab" && event.shiftKey) {
        isShiftTabRef.current = true;

        if (event.target !== event.currentTarget) {
          store.setFocusedState(null);

          if (!(event.currentTarget instanceof HTMLElement)) return;
          event.currentTarget.focus();
        }

        setTimeout(() => {
          isShiftTabRef.current = false;
        }, 0);

        return;
      }

      if (event.key === "Tab") return;

      const isRtl = dir === "rtl";
      const isVertical = orientation === "vertical" || orientation === "mixed";
      const isHorizontal =
        orientation === "horizontal" || orientation === "mixed";

      const items = getItems().filter((item) => !item.disabled);
      const itemCount = items.length;

      if (itemCount === 0) return;

      const focusedValue = store.getState().focusedValue;
      const currentIndex = focusedValue
        ? items.findIndex((item) => item.value === focusedValue)
        : -1;

      let nextItem: CollectionItem | null = null;

      const { columnCount, rowCount } = calculateGridLayout(items, orientation);

      switch (event.key) {
        case "Home": {
          const minValue = getMinItemValue(items);
          if (minValue) {
            const minItem =
              items.find((item) => item.value === minValue) ?? null;
            if (minItem?.ref.current && !virtual) {
              minItem.ref.current?.focus();
              store.setFocusedState(minValue);
              onFocusedValueChange(minValue);
            }
          }
          event.preventDefault();
          break;
        }

        case "End": {
          const maxValue = getMaxItemValue(items);
          if (maxValue) {
            const maxItem =
              items.find((item) => item.value === maxValue) ?? null;
            if (maxItem?.ref.current && !virtual) {
              maxItem.ref.current?.focus();
              store.setFocusedState(maxValue);
              onFocusedValueChange(maxValue);
            }
          }
          event.preventDefault();
          break;
        }

        case "ArrowUp":
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

        case "ArrowDown":
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

        case "ArrowLeft":
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

        case "ArrowRight":
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

        case "Enter":
        case " ":
          if (focusedValue) {
            const isMultipleSelectionKey =
              multiple && (multiple === true || event.ctrlKey || event.metaKey);
            onItemSelect(focusedValue, isMultipleSelectionKey);
            onFocusedValueChange(focusedValue);
            event.preventDefault();
          }
          break;

        default:
          return;
      }

      if (nextItem) {
        if (!virtual && nextItem.ref.current) {
          nextItem.ref.current?.focus();
          store.setFocusedState(nextItem.value);
          onFocusedValueChange(nextItem.value);
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
      onFocusedValueChange,
    ],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      if (isShiftTabRef.current) return;

      if (event.target === event.currentTarget) {
        const items = getItems().filter((item) => !item.disabled);

        if (items.length === 0) return;

        if (lastFocusedValueRef.current) {
          const lastFocusedItem = items.find(
            (item) =>
              item.value === lastFocusedValueRef.current && !item.disabled,
          );

          if (lastFocusedItem) {
            focusItemByValue(lastFocusedValueRef.current);
            return;
          }
        }

        const firstItem = items[0];
        if (firstItem?.ref.current && !virtual) {
          firstItem.ref.current?.focus();
          store.setFocusedState(firstItem.value);
          onFocusedValueChange(firstItem.value);
        }
      }
    },
    [focusItemByValue, getItems, virtual, store, onFocusedValueChange],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      if (
        collectionRef.current &&
        !collectionRef.current.contains(event.relatedTarget)
      ) {
        store.setFocusedState(null);
      }
    },
    [store, collectionRef],
  );

  const contextValue = React.useMemo<SelectableContextValue>(
    () => ({
      store,
      onItemRegister,
      onItemSelect,
      onItemFocus,
      onItemBlur,
      dir,
      disabled,
      multiple,
    }),
    [
      store,
      onItemRegister,
      onItemSelect,
      onItemFocus,
      onItemBlur,
      dir,
      disabled,
      multiple,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <SelectableContext.Provider value={contextValue}>
      <RootPrimitive
        role="listbox"
        aria-multiselectable={multiple ? "true" : undefined}
        data-orientation={orientation}
        data-slot="selectable"
        dir={dir}
        tabIndex={disabled ? undefined : 0}
        {...rootProps}
        ref={composedRef}
        onKeyDown={composeEventHandlers(rootProps.onKeyDown, onKeyDown)}
        onFocus={composeEventHandlers(rootProps.onFocus, onFocus)}
        onBlur={composeEventHandlers(rootProps.onBlur, onBlur)}
        className={cn(
          "focus-visible:outline-none",
          orientation === "horizontal" && "flex items-center gap-2",
          orientation === "vertical" && "flex flex-col gap-2",
          className,
        )}
      />
    </SelectableContext.Provider>
  );
}

type SelectableRootComponent = (<Multiple extends boolean = false>(
  props: SelectableRootProps<Multiple> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement) &
  Pick<React.FC<SelectableRootProps<boolean>>, "displayName">;

const SelectableRoot = React.forwardRef(
  SelectableRootImpl,
) as SelectableRootComponent;
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

    const isSelected = useSelectableState((state) =>
      state.selectedValues.has(itemValue),
    );
    const isFocused = useSelectableState(
      (state) => state.focusedValue === itemValue,
    );
    const isDisabled = disabled || context.disabled;

    useIsomorphicLayoutEffect(() => {
      return context.onItemRegister({
        ref: itemRef,
        value: itemValue,
        disabled: isDisabled,
      });
    }, [itemValue, isDisabled, context.onItemRegister]);

    const onFocus = React.useCallback(() => {
      if (!isDisabled) {
        context.onItemFocus(itemValue);
      }
    }, [context.onItemFocus, isDisabled, itemValue]);

    const onBlur = React.useCallback(() => {
      context.onItemBlur();
    }, [context.onItemBlur]);

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (!isDisabled) {
          const isMultipleSelectionKey =
            context.multiple &&
            (context.multiple === true || event.ctrlKey || event.metaKey);

          context.onItemSelect(itemValue, isMultipleSelectionKey);
        }
      },
      [context.onItemSelect, itemValue, isDisabled, context.multiple],
    );

    const onKeyDown = React.useCallback(
      (event: React.KeyboardEvent) => {
        if (event.key === "Tab") {
          if (!event.shiftKey) {
            context.onItemBlur();
          }
          return;
        }
      },
      [context.onItemBlur],
    );

    const ItemPrimitive = asChild ? Slot : "div";

    return (
      <ItemPrimitive
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
        onKeyDown={composeEventHandlers(itemProps.onKeyDown, onKeyDown)}
        className={cn(
          "cursor-default select-none ring-1 ring-transparent hover:bg-accent focus-visible:outline-none focus-visible:ring-ring data-disabled:pointer-events-none data-selected:bg-accent data-selected:text-accent-foreground data-disabled:opacity-50",
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
