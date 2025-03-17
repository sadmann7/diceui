import * as React from "react";
import { composeEventHandlers } from "./compose-event-handlers";
import { useComposedRefs } from "./compose-refs";
import {
  type WithDisplayName,
  type WithForwardedRef,
  forwardRef,
} from "./forward-ref";
import { Slot } from "./slot";
import { VisuallyHiddenInput } from "./visually-hidden-input";

const ROOT_NAME = "Listbox";
const ITEM_NAME = "ListboxItem";
const ITEM_INDICATOR_NAME = "ListboxItemIndicator";
const GROUP_NAME = "ListboxGroup";
const GROUP_LABEL_NAME = "ListboxGroupLabel";
const ITEM_SELECT_EVENT = `${ITEM_NAME}.Select.Event`;

const LISTBOX_ERRORS = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` must be used as root component`,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_INDICATOR_NAME]: `\`${ITEM_INDICATOR_NAME}\` must be within \`${ITEM_NAME}\``,
  [GROUP_NAME]: `\`${GROUP_NAME}\` must be within \`${ROOT_NAME}\``,
  [GROUP_LABEL_NAME]: `\`${GROUP_LABEL_NAME}\` must be within \`${GROUP_NAME}\``,
} as const;

type Value<Multiple extends boolean = false> = Multiple extends true
  ? string[]
  : string;

interface ListboxState {
  selectedValues: Set<string>;
  focusedValue: string | null;
  highlightedValue: string | null;
}

type StoreListener = () => void;
type StoreStateSelector<T> = (state: ListboxState) => T;

interface ListboxStore {
  onSubscribe: (callback: StoreListener) => () => void;
  getSnapshot: () => ListboxState;
  onStateChange: <K extends keyof ListboxState>(
    key: K,
    value: ListboxState[K],
    silent?: boolean,
  ) => void;
  onEmit: () => void;
  onSelectedStateChange: (value: string, multiple?: boolean) => void;
  onClearSelection: () => void;
  onHighlightedValueChange: (value: string | null) => void;
}

function createSelectableStore(
  defaultValue: string | null = null,
): ListboxStore {
  const state: ListboxState = {
    selectedValues: defaultValue
      ? new Set<string>([defaultValue])
      : new Set<string>(),
    focusedValue: null,
    highlightedValue: null,
  };

  const listeners = new Set<StoreListener>();

  const store: ListboxStore = {
    onSubscribe(callback: StoreListener) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    getSnapshot() {
      return state;
    },

    onStateChange<K extends keyof ListboxState>(
      key: K,
      value: ListboxState[K],
      silent = false,
    ) {
      if (Object.is(state[key], value)) return;

      state[key] = value;

      if (!silent) {
        queueMicrotask(() => store.onEmit());
      }
    },

    onEmit() {
      for (const listener of listeners) {
        listener();
      }
    },

    onSelectedStateChange(value: string, multiple = false) {
      const newSelectedValues = new Set(state.selectedValues);

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
        state.selectedValues.size !== newSelectedValues.size ||
        ![...newSelectedValues].every((v) => state.selectedValues.has(v));

      if (hasChanged) {
        store.onStateChange("selectedValues", newSelectedValues);
      }
    },

    onClearSelection() {
      if (state.selectedValues.size > 0) {
        store.onStateChange("selectedValues", new Set<string>());
      }
    },

    onHighlightedValueChange(value: string | null) {
      store.onStateChange("highlightedValue", value);
    },
  };

  return store;
}

function useListboxState<T>(selector: StoreStateSelector<T>): T {
  const store = useListboxContext(ROOT_NAME).store;

  const subscribe = React.useCallback(
    (callback: StoreListener) => {
      return store.onSubscribe(callback);
    },
    [store],
  );

  const getSnapshot = React.useCallback(() => {
    return selector(store.getSnapshot());
  }, [store, selector]);

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

type RootElement = HTMLDivElement;
type ItemElement = React.ComponentRef<typeof ListboxItem>;

interface ItemData {
  value: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
}

interface CollectionItem extends ItemData {
  ref: React.RefObject<ItemElement | null>;
}

type CollectionItemMap = Map<
  React.RefObject<ItemElement | null>,
  CollectionItem
>;

type CollectionGroupMap = Map<string, Set<React.RefObject<ItemElement | null>>>;

function useCollection() {
  const collectionRef = React.useRef<RootElement | null>(null);
  const itemMap = useLazyRef<CollectionItemMap>(() => new Map()).current;
  const groupMap = useLazyRef<CollectionGroupMap>(() => new Map()).current;

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
    (item: CollectionItem, groupId?: string) => {
      itemMap.set(item.ref, item);

      if (groupId) {
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, new Set());
        }
        groupMap.get(groupId)?.add(item.ref);
      }

      return () => {
        itemMap.delete(item.ref);
        if (groupId) {
          const group = groupMap.get(groupId);
          group?.delete(item.ref);
          if (group?.size === 0) {
            groupMap.delete(groupId);
          }
        }
      };
    },
    [itemMap, groupMap],
  );

  return {
    collectionRef,
    itemMap,
    groupMap,
    getItems,
    onItemRegister,
  };
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

function dispatchDiscreteCustomEvent<E extends CustomEvent>(
  target: EventTarget,
  event: E,
) {
  if (target && "dispatchEvent" in target && target.dispatchEvent) {
    target.dispatchEvent(event);
  }
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function useLazyRef<T>(init: () => T): React.RefObject<T> {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = init();
  }

  return ref as React.RefObject<T>;
}

interface ListboxContextValue<Multiple extends boolean = false> {
  store: ListboxStore;
  onItemRegister: (item: CollectionItem, groupId?: string) => () => void;
  onItemSelect: (value: string, isMultipleEvent?: boolean) => void;
  onItemFocus: (value: string) => void;
  onItemBlur: () => void;
  onItemHighlight: (value: string | null) => void;
  dir: "ltr" | "rtl";
  disabled: boolean;
  multiple: Multiple;
}

const ListboxContext = React.createContext<ListboxContextValue<boolean> | null>(
  null,
);
ListboxContext.displayName = ROOT_NAME;

function useListboxContext(name: keyof typeof LISTBOX_ERRORS) {
  const context = React.useContext(ListboxContext);
  if (!context) {
    throw new Error(LISTBOX_ERRORS[name]);
  }
  return context;
}

interface ListboxRootProps<Multiple extends boolean = false>
  extends React.ComponentPropsWithoutRef<"div"> {
  defaultValue?: Value<Multiple>;
  value?: Value<Multiple>;
  onValueChange?: (value: Value<Multiple>) => void;
  dir?: "ltr" | "rtl";
  asChild?: boolean;
  disabled?: boolean;
  loop?: boolean;
  multiple?: Multiple;
  virtual?: boolean;
  orientation?: "horizontal" | "vertical" | "mixed";
  name?: string;
}

function ListboxRootImpl<Multiple extends boolean = false>(
  props: ListboxRootProps<Multiple>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const {
    defaultValue,
    value,
    onValueChange,
    dir = "ltr",
    disabled = false,
    loop = false,
    multiple = false,
    orientation = "vertical",
    name,
    virtual = false,
    asChild,
    ...rootProps
  } = props;

  const storeRef = useLazyRef<ListboxStore>(() => {
    const store = createSelectableStore(
      typeof defaultValue === "string" ? defaultValue : null,
    );

    if (multiple && Array.isArray(defaultValue) && defaultValue.length) {
      for (const val of defaultValue) {
        if (val) store.onSelectedStateChange(val, true);
      }
    }

    return store;
  });

  const store = storeRef.current;

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.onClearSelection();

      if (multiple && Array.isArray(value)) {
        for (const val of value) {
          if (val) store.onSelectedStateChange(val, true);
        }
      } else if (typeof value === "string" && value) {
        store.onSelectedStateChange(value, false);
      }
    }
  }, [value, multiple, store]);

  const [focusedValue, setFocusedValue] = React.useState<string | null>(null);

  const { collectionRef, getItems, onItemRegister } = useCollection();

  const isShiftTabRef = useLazyRef(() => false);
  const composedRef = useComposedRefs(collectionRef, forwardedRef);

  const isFormControl = collectionRef.current
    ? !!collectionRef.current.closest("form")
    : true;

  const onItemSelect = React.useCallback(
    (itemValue: string, isMultipleEvent = false) => {
      const allItems = getItems();
      const item = allItems.find((item) => item.value === itemValue);

      if (item?.ref.current && item.onSelect) {
        const itemSelectEvent = new CustomEvent(ITEM_SELECT_EVENT, {
          bubbles: true,
        });

        item.ref.current.addEventListener(
          ITEM_SELECT_EVENT,
          () => item.onSelect?.(itemValue),
          {
            once: true,
          },
        );

        if (item.ref.current instanceof HTMLElement) {
          dispatchDiscreteCustomEvent(item.ref.current, itemSelectEvent);
        }
      }

      if (multiple) {
        if (isMultipleEvent) {
          const currentValues = new Set(
            Array.isArray(value) ? value : value ? [value] : [],
          );

          if (currentValues.has(itemValue)) {
            currentValues.delete(itemValue);
          } else {
            currentValues.add(itemValue);
            setFocusedValue(itemValue);
          }

          onValueChange?.([...currentValues] as Value<Multiple>);
        } else {
          onValueChange?.([itemValue] as Value<Multiple>);
          setFocusedValue(itemValue);
        }
      } else {
        if (value === itemValue) {
          onValueChange?.("" as Value<Multiple>);
        } else {
          onValueChange?.(itemValue as Value<Multiple>);
          setFocusedValue(itemValue);
        }
      }

      store.onSelectedStateChange(itemValue, multiple && isMultipleEvent);
    },
    [value, onValueChange, store, multiple, getItems],
  );

  const onItemFocus = React.useCallback(
    (value: string) => {
      store.onStateChange("focusedValue", value);
      setFocusedValue(value);
    },
    [store],
  );

  const onItemBlur = React.useCallback(() => {
    store.onStateChange("focusedValue", null);
  }, [store]);

  const onItemHighlight = React.useCallback(
    (value: string | null) => {
      store.onHighlightedValueChange(value);
    },
    [store],
  );

  const focusItemByValue = React.useCallback(
    (value: string) => {
      const allItems = getItems();

      const item = allItems.find((item) => item.value === value);
      if (item?.ref.current && !virtual && !item.disabled) {
        item.ref.current?.focus();
        store.onStateChange("focusedValue", value);
        setFocusedValue(value);
        store.onHighlightedValueChange(value);
      }
    },
    [getItems, store, virtual],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<RootElement>) => {
      if (disabled) return;

      if (event.key === "Tab" && event.shiftKey) {
        isShiftTabRef.current = true;

        if (event.target !== event.currentTarget) {
          store.onStateChange("focusedValue", null);

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

      const focusedValue = store.getSnapshot().focusedValue;
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
              store.onStateChange("focusedValue", minValue);
              setFocusedValue(minValue);
              store.onHighlightedValueChange(minValue);
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
              store.onStateChange("focusedValue", maxValue);
              setFocusedValue(maxValue);
              store.onHighlightedValueChange(maxValue);
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
              nextItem = items[0] ?? null;
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
            setFocusedValue(focusedValue);

            const focusedItem = items.find(
              (item) => item.value === focusedValue,
            );
            if (focusedItem?.ref.current instanceof HTMLElement) {
              focusedItem.ref.current.scrollIntoView({
                block: "nearest",
                inline: "nearest",
              });
            }

            event.preventDefault();
          }
          break;

        case "Escape":
          store.onStateChange("focusedValue", null);
          store.onHighlightedValueChange(null);
          event.preventDefault();
          break;

        default:
          return;
      }

      if (nextItem) {
        if (!virtual && nextItem.ref.current) {
          nextItem.ref.current?.focus();
          store.onStateChange("focusedValue", nextItem.value);
          setFocusedValue(nextItem.value);
          store.onHighlightedValueChange(nextItem.value);
        }
      }
    },
    [
      dir,
      orientation,
      store,
      onItemSelect,
      getItems,
      isShiftTabRef,
      disabled,
      loop,
      virtual,
      multiple,
    ],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      if (isShiftTabRef.current) return;

      if (event.target === event.currentTarget) {
        const items = getItems().filter((item) => !item.disabled);

        if (items.length === 0) return;

        if (focusedValue) {
          const lastFocusedItem = items.find(
            (item) => item.value === focusedValue,
          );

          if (lastFocusedItem) {
            focusItemByValue(focusedValue);
            return;
          }
        }

        const firstItem = items[0];
        if (firstItem?.ref.current && !virtual) {
          firstItem.ref.current?.focus();
          store.onStateChange("focusedValue", firstItem.value);
          setFocusedValue(firstItem.value);
        }
      }
    },
    [focusItemByValue, getItems, virtual, store, focusedValue, isShiftTabRef],
  );

  const onBlur = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      if (
        collectionRef.current &&
        !collectionRef.current.contains(event.relatedTarget)
      ) {
        store.onStateChange("focusedValue", null);
      }
    },
    [store, collectionRef],
  );

  const contextValue = React.useMemo<ListboxContextValue<typeof multiple>>(
    () => ({
      store,
      onItemRegister,
      onItemSelect,
      onItemFocus,
      onItemBlur,
      onItemHighlight,
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
      onItemHighlight,
      dir,
      disabled,
      multiple,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <ListboxContext.Provider value={contextValue}>
      <RootPrimitive
        role="listbox"
        aria-multiselectable={multiple ? "true" : undefined}
        data-orientation={orientation}
        dir={dir}
        tabIndex={disabled ? undefined : 0}
        {...rootProps}
        ref={composedRef}
        onKeyDown={composeEventHandlers(rootProps.onKeyDown, onKeyDown)}
        onFocus={composeEventHandlers(rootProps.onFocus, onFocus)}
        onBlur={composeEventHandlers(rootProps.onBlur, onBlur)}
      />
      {isFormControl && (
        <VisuallyHiddenInput
          type="hidden"
          control={collectionRef.current}
          name={name}
          value={value}
          disabled={disabled}
        />
      )}
    </ListboxContext.Provider>
  );
}

interface ListboxRootComponentProps extends WithDisplayName {
  <Multiple extends boolean = false>(
    props: ListboxRootProps<Multiple> &
      WithForwardedRef<typeof ListboxRootImpl>,
  ): React.JSX.Element;
}

const ListboxRoot = forwardRef(ListboxRootImpl) as ListboxRootComponentProps;
ListboxRoot.displayName = ROOT_NAME;

interface ListboxGroupContextValue {
  id: string;
  labelId: string;
}

const ListboxGroupContext =
  React.createContext<ListboxGroupContextValue | null>(null);
ListboxGroupContext.displayName = GROUP_NAME;

function useListboxGroupContext(name: keyof typeof LISTBOX_ERRORS) {
  const context = React.useContext(ListboxGroupContext);
  if (!context) {
    throw new Error(LISTBOX_ERRORS[name]);
  }
  return context;
}
interface ListboxGroupProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const ListboxGroup = React.forwardRef<HTMLDivElement, ListboxGroupProps>(
  (props, forwardedRef) => {
    const { asChild, ...groupProps } = props;
    const id = React.useId();
    const labelId = React.useId();

    const groupContextValue = React.useMemo(
      () => ({ id, labelId }),
      [id, labelId],
    );

    const GroupPrimitive = asChild ? Slot : "div";

    return (
      <ListboxGroupContext.Provider value={groupContextValue}>
        <GroupPrimitive
          role="group"
          id={id}
          aria-labelledby={labelId}
          {...groupProps}
          ref={forwardedRef}
        />
      </ListboxGroupContext.Provider>
    );
  },
);
ListboxGroup.displayName = GROUP_NAME;

interface ListboxGroupLabelProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const ListboxGroupLabel = React.forwardRef<
  HTMLDivElement,
  ListboxGroupLabelProps
>((props, forwardedRef) => {
  const { asChild, ...labelProps } = props;
  const groupContext = useListboxGroupContext(GROUP_LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      id={groupContext.labelId}
      {...labelProps}
      ref={forwardedRef}
    />
  );
});
ListboxGroupLabel.displayName = GROUP_LABEL_NAME;

const ListboxItemContext = React.createContext<{
  isSelected: boolean;
} | null>(null);
ListboxItemContext.displayName = ITEM_NAME;

function useListboxItemContext(name: keyof typeof LISTBOX_ERRORS) {
  const context = React.useContext(ListboxItemContext);
  if (!context) {
    throw new Error(LISTBOX_ERRORS[name]);
  }
  return context;
}

interface ListboxItemProps
  extends Omit<React.ComponentPropsWithoutRef<"div">, "onSelect"> {
  value: string;
  disabled?: boolean;
  asChild?: boolean;
  onSelect?: (value: string) => void;
}

const ListboxItem = React.forwardRef<HTMLDivElement, ListboxItemProps>(
  (props, forwardedRef) => {
    const { asChild, value, disabled = false, onSelect, ...itemProps } = props;
    const context = useListboxContext(ITEM_NAME);
    const groupContext = React.useContext(ListboxGroupContext);
    const itemRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(itemRef, forwardedRef);

    const isSelected = useListboxState((state) =>
      state.selectedValues.has(value),
    );
    const isHighlighted = useListboxState(
      (state) => state.highlightedValue === value,
    );
    const isDisabled = disabled || context.disabled;

    useIsomorphicLayoutEffect(() => {
      if (value === "") {
        throw new Error(`${ITEM_NAME} value cannot be an empty string`);
      }

      return context.onItemRegister(
        {
          ref: itemRef,
          value,
          disabled: isDisabled,
          onSelect,
        },
        groupContext?.id,
      );
    }, [value, isDisabled, context.onItemRegister, groupContext?.id, onSelect]);

    const onBlur = React.useCallback(() => {
      context.onItemBlur();
    }, [context.onItemBlur]);

    const onClick = React.useCallback(
      (event: React.MouseEvent) => {
        if (!isDisabled) {
          const isMultipleSelectionKey =
            context.multiple &&
            (context.multiple === true || event.ctrlKey || event.metaKey);

          context.onItemSelect(value, isMultipleSelectionKey);
        }
      },
      [context.onItemSelect, value, isDisabled, context.multiple],
    );

    const onFocus = React.useCallback(() => {
      if (!isDisabled) {
        context.onItemFocus(value);
        context.onItemHighlight(value);
      }
    }, [context.onItemFocus, context.onItemHighlight, isDisabled, value]);

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

    const onPointerLeave = React.useCallback(() => {
      context.onItemHighlight(null);
    }, [context.onItemHighlight]);

    const onPointerMove = React.useCallback(() => {
      if (!isDisabled) {
        context.onItemHighlight(value);
      }
    }, [context.onItemHighlight, isDisabled, value]);

    const ItemPrimitive = asChild ? Slot : "div";

    const itemContextValue = React.useMemo(
      () => ({ isSelected }),
      [isSelected],
    );

    return (
      <ListboxItemContext.Provider value={itemContextValue}>
        <ItemPrimitive
          role="option"
          aria-selected={isSelected}
          data-selected={isSelected ? "" : undefined}
          data-highlighted={isHighlighted ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          tabIndex={isDisabled ? undefined : -1}
          {...itemProps}
          ref={composedRef}
          onClick={composeEventHandlers(itemProps.onClick, onClick)}
          onFocus={composeEventHandlers(itemProps.onFocus, onFocus)}
          onBlur={composeEventHandlers(itemProps.onBlur, onBlur)}
          onKeyDown={composeEventHandlers(itemProps.onKeyDown, onKeyDown)}
          onPointerLeave={composeEventHandlers(
            itemProps.onPointerLeave,
            onPointerLeave,
          )}
          onPointerMove={composeEventHandlers(
            itemProps.onPointerMove,
            onPointerMove,
          )}
        />
      </ListboxItemContext.Provider>
    );
  },
);
ListboxItem.displayName = ITEM_NAME;

interface ListboxItemIndicatorProps
  extends React.ComponentPropsWithoutRef<"span"> {
  forceMount?: boolean;
  asChild?: boolean;
}

const ListboxItemIndicator = React.forwardRef<
  HTMLSpanElement,
  ListboxItemIndicatorProps
>((props, forwardedRef) => {
  const { forceMount = false, asChild, ...indicatorProps } = props;
  const itemContext = useListboxItemContext(ITEM_INDICATOR_NAME);

  if (!forceMount && !itemContext.isSelected) return null;

  const IndicatorPrimitive = asChild ? Slot : "span";

  return (
    <IndicatorPrimitive
      aria-hidden="true"
      {...indicatorProps}
      ref={forwardedRef}
    />
  );
});
ListboxItemIndicator.displayName = ITEM_INDICATOR_NAME;

const Root = ListboxRoot;
const Item = ListboxItem;
const ItemIndicator = ListboxItemIndicator;
const Group = ListboxGroup;
const GroupLabel = ListboxGroupLabel;

export {
  ListboxRoot,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
  //
  Root,
  Group,
  GroupLabel,
  Item,
  ItemIndicator,
};

export type {
  ListboxRootProps,
  ListboxRootComponentProps,
  ListboxGroupProps,
  ListboxGroupLabelProps,
  ListboxItemProps,
  ListboxItemIndicatorProps,
};
