"use client";

import { Slot } from "@radix-ui/react-slot";
import { Star } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "Rating";
const ITEM_NAME = "RatingItem";

const ENTRY_FOCUS = "ratingFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

function getItemId(id: string, value: number) {
  return `${id}-item-${value}`;
}

function getPartialFillGradientId(id: string, step: Step) {
  return `partial-fill-gradient-${id}-${step}`;
}

type FocusIntent = "first" | "last" | "prev" | "next";

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  Home: "first",
  End: "last",
};

function getDirectionAwareKey(key: string, dir?: Direction) {
  if (dir !== "rtl") return key;
  return key === "ArrowLeft"
    ? "ArrowRight"
    : key === "ArrowRight"
      ? "ArrowLeft"
      : key;
}

type ItemElement = React.ComponentRef<typeof RatingItem>;

function getFocusIntent(
  event: React.KeyboardEvent<ItemElement>,
  dir?: Direction,
  orientation?: Orientation,
) {
  const key = getDirectionAwareKey(event.key, dir);
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key))
    return undefined;
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key))
    return undefined;
  return MAP_KEY_TO_FOCUS_INTENT[key];
}

function focusFirst(
  candidates: React.RefObject<ItemElement | null>[],
  preventScroll = false,
) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type ActivationMode = "automatic" | "manual";
type Size = "default" | "sm" | "lg";
type Step = 0.5 | 1;
type DataState = "full" | "partial" | "empty";

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface StoreState {
  value: number;
  hoveredValue: number | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: number) => void,
  onHover?: (value: number | null) => void,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        value: 0,
        hoveredValue: null,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (key === "value" && typeof value === "number") {
        state.value = value;
        onValueChange?.(value);
      } else if (key === "hoveredValue") {
        state.hoveredValue = value as number | null;
        onHover?.(value as number | null);
      } else {
        state[key] = value;
      }

      store.notify();
    },
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
  };

  return store;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface ItemData {
  id: string;
  ref: React.RefObject<ItemElement | null>;
  value: number;
  disabled: boolean;
}

interface RatingContextValue {
  id: string;
  dir: Direction;
  orientation: Orientation;
  activationMode: ActivationMode;
  size: Size;
  max: number;
  step: Step;
  clearable: boolean;
  disabled: boolean;
  readOnly: boolean;
  getAutoIndex: (instanceId: string) => number;
}

const RatingContext = React.createContext<RatingContextValue | null>(null);

function useRatingContext(consumerName: string) {
  const context = React.useContext(RatingContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface FocusContextValue {
  tabStopId: string | null;
  onItemFocus: (tabStopId: string) => void;
  onItemShiftTab: () => void;
  onFocusableItemAdd: () => void;
  onFocusableItemRemove: () => void;
  onItemRegister: (item: ItemData) => void;
  onItemUnregister: (id: string) => void;
  getItems: () => ItemData[];
}

const FocusContext = React.createContext<FocusContextValue | null>(null);

function useFocusContext(consumerName: string) {
  const context = React.useContext(FocusContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`FocusProvider\``,
    );
  }
  return context;
}

interface RatingRootProps extends React.ComponentProps<"div"> {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  onHover?: (value: number | null) => void;
  max?: number;
  activationMode?: ActivationMode;
  dir?: Direction;
  orientation?: Orientation;
  size?: Size;
  asChild?: boolean;
  step?: Step;
  clearable?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
}

function RatingRoot(props: RatingRootProps) {
  const {
    value,
    defaultValue = 0,
    onValueChange,
    onHover,
    ...rootProps
  } = props;

  const stateRef = useLazyRef(() => ({
    value: value ?? defaultValue,
    hoveredValue: null,
  }));
  const listenersRef = useLazyRef(() => new Set<() => void>());

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef, onValueChange, onHover),
    [listenersRef, stateRef, onValueChange, onHover],
  );

  return (
    <StoreContext.Provider value={store}>
      <RatingRootImpl {...rootProps} value={value} />
    </StoreContext.Provider>
  );
}

interface RatingRootImplProps
  extends Omit<RatingRootProps, "defaultValue" | "onValueChange" | "onHover"> {}

function RatingRootImpl(props: RatingRootImplProps) {
  const {
    value,
    id: idProp,
    dir: dirProp,
    orientation = "horizontal",
    activationMode = "automatic",
    size = "default",
    max = 5,
    step = 1,
    clearable = false,
    asChild,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    className,
    ref,
    ...rootProps
  } = props;

  const store = useStoreContext("RatingRootImpl");

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value]);

  const dir = useDirection(dirProp);
  const id = React.useId();
  const rootId = idProp ?? id;
  const currentValue = useStore((state) => state.value);

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, (node) => setFormTrigger(node));

  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const [focusableItemCount, setFocusableItemCount] = React.useState(0);
  const isClickFocusRef = React.useRef(false);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());

  const autoIndexMapRef = React.useRef(new Map<string, number>());
  const nextAutoIndexRef = React.useRef(0);

  const getAutoIndex = React.useCallback((instanceId: string) => {
    const existingIndex = autoIndexMapRef.current.get(instanceId);
    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const newIndex = nextAutoIndexRef.current++;
    autoIndexMapRef.current.set(instanceId, newIndex);
    return newIndex;
  }, []);

  const onItemFocus = React.useCallback((tabStopId: string) => {
    setTabStopId(tabStopId);
  }, []);

  const onItemShiftTab = React.useCallback(() => {
    setIsTabbingBackOut(true);
  }, []);

  const onFocusableItemAdd = React.useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount + 1);
  }, []);

  const onFocusableItemRemove = React.useCallback(() => {
    setFocusableItemCount((prevCount) => prevCount - 1);
  }, []);

  const onItemRegister = React.useCallback((item: ItemData) => {
    itemsRef.current.set(item.id, item);
  }, []);

  const onItemUnregister = React.useCallback((id: string) => {
    itemsRef.current.delete(id);
  }, []);

  const getItems = React.useCallback(() => {
    return Array.from(itemsRef.current.values())
      .filter((item) => item.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, []);

  const onBlur = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      rootProps.onBlur?.(event);
      if (event.defaultPrevented) return;

      setIsTabbingBackOut(false);
    },
    [rootProps.onBlur],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<HTMLDivElement>) => {
      rootProps.onFocus?.(event);
      if (event.defaultPrevented) return;

      const isKeyboardFocus = !isClickFocusRef.current;
      if (
        event.target === event.currentTarget &&
        isKeyboardFocus &&
        !isTabbingBackOut
      ) {
        const entryFocusEvent = new CustomEvent(ENTRY_FOCUS, EVENT_OPTIONS);
        event.currentTarget.dispatchEvent(entryFocusEvent);

        if (!entryFocusEvent.defaultPrevented) {
          const items = Array.from(itemsRef.current.values()).filter(
            (item) => !item.disabled,
          );
          const selectedItem = items.find(
            (item) => item.value === currentValue,
          );
          const currentItem = items.find((item) => item.id === tabStopId);

          const candidateItems = [selectedItem, currentItem, ...items].filter(
            Boolean,
          ) as ItemData[];
          const candidateRefs = candidateItems.map((item) => item.ref);
          focusFirst(candidateRefs, false);
        }
      }
      isClickFocusRef.current = false;
    },
    [rootProps.onFocus, isTabbingBackOut, currentValue, tabStopId],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      rootProps.onMouseDown?.(event);

      if (event.defaultPrevented) return;

      isClickFocusRef.current = true;
    },
    [rootProps.onMouseDown],
  );

  const contextValue = React.useMemo<RatingContextValue>(
    () => ({
      id: rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      getAutoIndex,
      max,
      step,
      clearable,
    }),
    [
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      getAutoIndex,
      max,
      step,
      clearable,
    ],
  );

  const focusContextValue = React.useMemo<FocusContextValue>(
    () => ({
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    }),
    [
      tabStopId,
      onItemFocus,
      onItemShiftTab,
      onFocusableItemAdd,
      onFocusableItemRemove,
      onItemRegister,
      onItemUnregister,
      getItems,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RatingContext.Provider value={contextValue}>
      <FocusContext.Provider value={focusContextValue}>
        <RootPrimitive
          id={rootId}
          role="radiogroup"
          aria-orientation={orientation}
          data-disabled={disabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-orientation={orientation}
          data-slot="rating"
          dir={dir}
          tabIndex={isTabbingBackOut || focusableItemCount === 0 ? -1 : 0}
          {...rootProps}
          ref={composedRef}
          className={cn(
            "flex gap-1 text-primary outline-none",
            orientation === "horizontal"
              ? "flex-row items-center"
              : "flex-col items-start",
            className,
          )}
          onBlur={onBlur}
          onFocus={onFocus}
          onMouseDown={onMouseDown}
        />
        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient id={getPartialFillGradientId(rootId, step)}>
              {dir === "rtl" ? (
                <>
                  <stop offset="50%" stopColor="transparent" />
                  <stop offset="50%" stopColor="currentColor" />
                </>
              ) : (
                <>
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </>
              )}
            </linearGradient>
          </defs>
        </svg>
        {isFormControl && (
          <VisuallyHiddenInput
            type="hidden"
            control={formTrigger}
            name={name}
            value={currentValue}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
          />
        )}
      </FocusContext.Provider>
    </RatingContext.Provider>
  );
}

interface RatingItemProps
  extends Omit<React.ComponentProps<"button">, "children"> {
  index?: number;
  asChild?: boolean;
  children?: React.ReactNode | ((dataState: DataState) => React.ReactNode);
}

function RatingItem(props: RatingItemProps) {
  const { index, asChild, disabled, className, ref, children, ...itemProps } =
    props;

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);

  const context = useRatingContext(ITEM_NAME);

  const instanceId = React.useId();

  const actualIndex = React.useMemo(() => {
    if (index !== undefined) {
      return index;
    }

    return context.getAutoIndex(instanceId);
  }, [index, context, instanceId]);

  const itemValue = actualIndex + 1;
  const store = useStoreContext(ITEM_NAME);
  const focusContext = useFocusContext(ITEM_NAME);
  const value = useStore((state) => state.value);
  const hoveredValue = useStore((state) => state.hoveredValue);
  const clearable = context.clearable;
  const step = context.step;
  const activationMode = context.activationMode;

  const itemId = getItemId(context.id, itemValue);
  const isDisabled = context.disabled || disabled;
  const isReadOnly = context.readOnly;
  const isTabStop = focusContext.tabStopId === itemId;

  const displayValue = hoveredValue ?? value;
  const isFilled = displayValue >= itemValue;
  const isPartiallyFilled =
    step < 1 && displayValue >= itemValue - step && displayValue < itemValue;
  const isHovered = hoveredValue !== null && hoveredValue < itemValue;

  const isMouseClickRef = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: itemId,
      ref: itemRef,
      value: itemValue,
      disabled: !!isDisabled,
    });

    if (!isDisabled) {
      focusContext.onFocusableItemAdd();
    }

    return () => {
      focusContext.onItemUnregister(itemId);
      if (!isDisabled) {
        focusContext.onFocusableItemRemove();
      }
    };
  }, [focusContext, itemId, itemValue, isDisabled]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      itemProps.onClick?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        let newValue = itemValue;

        if (step < 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          const clickX = event.clientX - rect.left;
          const isLeftHalf = clickX < rect.width / 2;

          if (context.dir === "rtl") {
            if (!isLeftHalf) {
              newValue = itemValue - step;
            }
          } else {
            if (isLeftHalf) {
              newValue = itemValue - step;
            }
          }
        }

        if (clearable && value === newValue) {
          newValue = 0;
        }

        store.setState("value", newValue);
      }
    },
    [
      isDisabled,
      isReadOnly,
      clearable,
      step,
      value,
      itemValue,
      store,
      context.dir,
      itemProps.onClick,
    ],
  );

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      itemProps.onMouseEnter?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        let hoverValue = itemValue;

        if (step < 1) {
          const rect = event.currentTarget.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const isLeftHalf = mouseX < rect.width / 2;

          if (context.dir === "rtl") {
            if (!isLeftHalf) {
              hoverValue = itemValue - step;
            }
          } else {
            if (isLeftHalf) {
              hoverValue = itemValue - step;
            }
          }
        }

        store.setState("hoveredValue", hoverValue);
      }
    },
    [
      isDisabled,
      isReadOnly,
      step,
      itemValue,
      store,
      context.dir,
      itemProps.onMouseEnter,
    ],
  );

  const onMouseMove = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      itemProps.onMouseMove?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly && step < 1) {
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const isLeftHalf = mouseX < rect.width / 2;

        let hoverValue = itemValue;
        if (context.dir === "rtl") {
          hoverValue = !isLeftHalf ? itemValue - step : itemValue;
        } else {
          hoverValue = isLeftHalf ? itemValue - step : itemValue;
        }

        store.setState("hoveredValue", hoverValue);
      }
    },
    [
      isDisabled,
      isReadOnly,
      step,
      itemValue,
      store,
      context.dir,
      itemProps.onMouseMove,
    ],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      itemProps.onMouseLeave?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        store.setState("hoveredValue", null);
      }
    },
    [isDisabled, isReadOnly, store, itemProps.onMouseLeave],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ItemElement>) => {
      itemProps.onFocus?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(itemId);

      const isKeyboardFocus = !isMouseClickRef.current;

      if (
        !isDisabled &&
        !isReadOnly &&
        activationMode !== "manual" &&
        isKeyboardFocus
      ) {
        const newValue = clearable && value === itemValue ? 0 : itemValue;
        store.setState("value", newValue);
      }

      isMouseClickRef.current = false;
    },
    [
      focusContext,
      itemId,
      activationMode,
      isDisabled,
      isReadOnly,
      clearable,
      value,
      itemValue,
      store,
      itemProps.onFocus,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<ItemElement>) => {
      itemProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (
        (event.key === "Enter" || event.key === " ") &&
        activationMode === "manual"
      ) {
        event.preventDefault();
        if (!isDisabled && !isReadOnly && itemRef.current) {
          itemRef.current.click();
        }
        return;
      }

      if (event.key === "Tab" && event.shiftKey) {
        focusContext.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) return;

      const focusIntent = getFocusIntent(
        event,
        context.dir,
        context.orientation,
      );

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
          return;
        event.preventDefault();

        const items = focusContext.getItems().filter((item) => !item.disabled);
        let candidateRefs = items.map((item) => item.ref);

        if (focusIntent === "last") {
          candidateRefs.reverse();
        } else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") candidateRefs.reverse();
          const currentIndex = candidateRefs.findIndex(
            (ref) => ref.current === event.currentTarget,
          );
          candidateRefs = candidateRefs.slice(currentIndex + 1);
        }

        queueMicrotask(() => focusFirst(candidateRefs));
      }
    },
    [
      focusContext,
      context.dir,
      context.orientation,
      activationMode,
      isDisabled,
      isReadOnly,
      itemProps.onKeyDown,
    ],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      itemProps.onMouseDown?.(event);
      if (event.defaultPrevented) return;

      isMouseClickRef.current = true;

      if (isDisabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(itemId);
      }
    },
    [focusContext, itemId, isDisabled, itemProps.onMouseDown],
  );

  const dataState: DataState = isFilled
    ? "full"
    : isPartiallyFilled
      ? "partial"
      : "empty";

  const ItemPrimitive = asChild ? Slot : "button";

  return (
    <ItemPrimitive
      id={itemId}
      role="radio"
      type="button"
      aria-checked={isFilled}
      aria-posinset={itemValue}
      aria-setsize={context.max}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={isReadOnly ? "" : undefined}
      data-state={isFilled ? "full" : isPartiallyFilled ? "partial" : "empty"}
      data-hovered={isHovered ? "" : undefined}
      data-slot="rating-item"
      disabled={isDisabled}
      tabIndex={isTabStop ? 0 : -1}
      {...itemProps}
      ref={composedRef}
      style={{
        ...itemProps.style,
        ...(isPartiallyFilled && {
          "--partial-fill": `url(#${getPartialFillGradientId(context.id, step)})`,
        }),
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        "[&_svg:not([class*='size-'])]:size-full [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:transition-colors [&_svg]:duration-200 data-[state=empty]:[&_svg]:fill-transparent data-[state=full]:[&_svg]:fill-current data-[state=partial]:[&_svg]:fill-[var(--partial-fill)]",
        context.size === "sm"
          ? "size-4"
          : context.size === "lg"
            ? "size-6"
            : "size-5",
        className,
      )}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {typeof children === "function"
        ? children(dataState)
        : (children ?? <Star />)}
    </ItemPrimitive>
  );
}

export {
  RatingRoot as Root,
  RatingItem as Item,
  //
  RatingRoot as Rating,
  RatingItem,
  //
  useStore as useRating,
};
