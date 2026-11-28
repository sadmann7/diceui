"use client";

import { ownerDocument } from "@base-ui/utils/owner";
import { activeElement } from "@base-ui/utils/shadowDom";
import { ReactStore, useStore } from "@base-ui/utils/store";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

import { VisuallyHiddenInput } from "@/registry/bases/radix/components/visually-hidden-input";
import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type ActivationMode = "automatic" | "manual";
type Size = "default" | "sm" | "lg";
type Step = 0.5 | 1;
type DataState = "full" | "partial" | "empty";
type FocusIntent = "first" | "last" | "prev" | "next";

type RootElement = HTMLDivElement;
type ItemElement = HTMLButtonElement;

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
  for (const candidateRef of candidates) {
    const candidate = candidateRef.current;
    if (!candidate) continue;
    const doc = ownerDocument(candidate);
    const previouslyFocusedElement = activeElement(doc);
    if (candidate === previouslyFocusedElement) return;
    candidate.focus({ preventScroll });
    if (activeElement(doc) !== previouslyFocusedElement) return;
  }
}

interface RatingState {
  value: number;
  hoveredValue: number | null;
}

interface StoreState extends RatingState {
  valueProp: number | undefined;
}

interface StoreContext {
  onValueChange: ((value: number) => void) | undefined;
  onHover: ((value: number | null) => void) | undefined;
}

const publicStates = new WeakMap<StoreState, RatingState>();

const selectors = {
  value: (state: StoreState) => state.valueProp ?? state.value,
  hoveredValue: (state: StoreState) => state.hoveredValue,
  publicState: (state: StoreState) => {
    let publicState = publicStates.get(state);
    if (!publicState) {
      publicState = {
        value: state.valueProp ?? state.value,
        hoveredValue: state.hoveredValue,
      };
      publicStates.set(state, publicState);
    }
    return publicState;
  },
};

type Store = ReactStore<StoreState, StoreContext, typeof selectors>;

function setValue(store: Store, value: number) {
  if (Object.is(store.select("value"), value)) return;
  store.context.onValueChange?.(value);
  store.set("value", value);
}

function setHoveredValue(store: Store, hoveredValue: number | null) {
  if (Object.is(store.state.hoveredValue, hoveredValue)) return;
  store.set("hoveredValue", hoveredValue);
  store.context.onHover?.(hoveredValue);
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useRating<T>(
  selector: (state: RatingState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useRating\` must be used within \`${ROOT_NAME}\``);
  }

  return useStore(store, (state: StoreState) =>
    selector(selectors.publicState(state)),
  );
}

interface ItemData {
  id: string;
  ref: React.RefObject<ItemElement | null>;
  value: number;
  disabled: boolean;
}

interface RatingContextValue {
  rootId: string;
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

interface RatingProps extends React.ComponentProps<"div"> {
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

function Rating(props: RatingProps) {
  const {
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    onHover,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    onMouseDown: onMouseDownProp,
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
    className,
    id,
    name,
    ref,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);
  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const [store] = React.useState<Store>(
    () =>
      new ReactStore<StoreState, StoreContext, typeof selectors>(
        { value: valueProp ?? defaultValue, valueProp, hoveredValue: null },
        { onValueChange, onHover },
        selectors,
      ),
  );

  store.useControlledProp("valueProp", valueProp);
  store.useContextCallback("onValueChange", onValueChange);
  store.useContextCallback("onHover", onHover);

  const propsRef = useValueAsRef({
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    onMouseDown: onMouseDownProp,
    step,
  });

  const value = store.useState("value");

  const [formTrigger, setFormTrigger] = React.useState<RootElement | null>(
    null,
  );
  const composedRef = useMergedRefs(ref, (node) => setFormTrigger(node));
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
    (event: React.FocusEvent<RootElement>) => {
      propsRef.current.onBlur?.(event);
      if (event.defaultPrevented) return;

      setIsTabbingBackOut(false);
    },
    [propsRef],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<RootElement>) => {
      propsRef.current.onFocus?.(event);
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
          // A half value belongs to the item above it, so 3.5 selects item 4.
          const selectedItem =
            propsRef.current.step < 1
              ? items.find((item) => item.value === Math.ceil(value))
              : items.find((item) => item.value === value);
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
    [propsRef, isTabbingBackOut, value, tabStopId],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<RootElement>) => {
      propsRef.current.onMouseDown?.(event);

      if (event.defaultPrevented) return;

      isClickFocusRef.current = true;
    },
    [propsRef],
  );

  const contextValue = React.useMemo<RatingContextValue>(
    () => ({
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      max,
      step,
      clearable,
      getAutoIndex,
    }),
    [
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      readOnly,
      size,
      max,
      step,
      clearable,
      getAutoIndex,
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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
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
              "cn-rating",
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
              value={value}
              disabled={disabled}
              readOnly={readOnly}
              required={required}
            />
          )}
        </FocusContext.Provider>
      </RatingContext.Provider>
    </StoreContext.Provider>
  );
}

interface RatingItemProps extends Omit<
  React.ComponentProps<"button">,
  "children"
> {
  index?: number;
  asChild?: boolean;
  children?: React.ReactNode | ((dataState: DataState) => React.ReactNode);
}

function RatingItem(props: RatingItemProps) {
  const {
    index,
    asChild,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
    disabled,
    className,
    children,
    ref,
    ...itemProps
  } = props;

  const itemRef = React.useRef<ItemElement>(null);
  const composedRef = useMergedRefs(ref, itemRef);

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
  const value = store.useState("value");
  const hoveredValue = store.useState("hoveredValue");
  const clearable = context.clearable;
  const step = context.step;
  const activationMode = context.activationMode;

  const itemId = getItemId(context.rootId, itemValue);
  const isDisabled = context.disabled || !!disabled;
  const isReadOnly = context.readOnly;
  const isTabStop = focusContext.tabStopId === itemId;

  const displayValue = hoveredValue ?? value;
  const isFilled = displayValue >= itemValue;
  const isPartiallyFilled =
    step < 1 && displayValue >= itemValue - step && displayValue < itemValue;
  const isHovered = hoveredValue !== null && hoveredValue < itemValue;

  const isMouseClickRef = React.useRef(false);

  const propsRef = useValueAsRef({
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    onMouseEnter: onMouseEnterProp,
    onMouseMove: onMouseMoveProp,
    onMouseLeave: onMouseLeaveProp,
  });

  useIsoLayoutEffect(() => {
    focusContext.onItemRegister({
      id: itemId,
      ref: itemRef,
      value: itemValue,
      disabled: isDisabled,
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
      propsRef.current.onClick?.(event);
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

        setValue(store, newValue);
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
      propsRef,
    ],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ItemElement>) => {
      propsRef.current.onFocus?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(itemId);

      const isKeyboardFocus = !isMouseClickRef.current;

      if (
        !isDisabled &&
        !isReadOnly &&
        activationMode !== "manual" &&
        isKeyboardFocus
      ) {
        const isHalfStepValue = step < 1 && value === itemValue - step;

        if (!isHalfStepValue) {
          const newValue = clearable && value === itemValue ? 0 : itemValue;
          setValue(store, newValue);
        }
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
      step,
      store,
      propsRef,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<ItemElement>) => {
      propsRef.current.onKeyDown?.(event);
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

        if (step < 1 && (focusIntent === "prev" || focusIntent === "next")) {
          if (!isDisabled && !isReadOnly) {
            let newValue = value;

            if (focusIntent === "next") {
              newValue = Math.min(value + step, context.max);
            } else {
              newValue = Math.max(value - step, 0);
            }

            setValue(store, newValue);

            const items = focusContext
              .getItems()
              .filter((item) => !item.disabled);
            const targetItem = items.find(
              (item) => item.value === Math.ceil(newValue),
            );
            if (targetItem?.ref.current) {
              queueMicrotask(() => targetItem.ref.current?.focus());
            }
          }
          return;
        }

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
      step,
      value,
      context.max,
      store,
      propsRef,
    ],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onMouseDown?.(event);
      if (event.defaultPrevented) return;

      isMouseClickRef.current = true;

      if (isDisabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(itemId);
      }
    },
    [focusContext, itemId, isDisabled, propsRef],
  );

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onMouseEnter?.(event);
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

        setHoveredValue(store, hoverValue);
      }
    },
    [isDisabled, isReadOnly, step, itemValue, store, context.dir, propsRef],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onMouseLeave?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !isReadOnly) {
        setHoveredValue(store, null);
      }
    },
    [isDisabled, isReadOnly, store, propsRef],
  );

  const onMouseMove = React.useCallback(
    (event: React.MouseEvent<ItemElement>) => {
      propsRef.current.onMouseMove?.(event);
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

        setHoveredValue(store, hoverValue);
      }
    },
    [isDisabled, isReadOnly, step, itemValue, store, context.dir, propsRef],
  );

  const dataState: DataState = isFilled
    ? "full"
    : isPartiallyFilled
      ? "partial"
      : "empty";

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "button";

  return (
    <ItemPrimitive
      role="radio"
      type="button"
      id={itemId}
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
          "--partial-fill": `url(#${getPartialFillGradientId(context.rootId, step)})`,
        }),
      }}
      className={cn(
        "cn-rating-item",
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
        : (children ?? (
            <IconPlaceholder
              lucide="Star"
              tabler="IconStar"
              hugeicons="StarIcon"
              phosphor="StarIcon"
              remixicon="RiStarLine"
            />
          ))}
    </ItemPrimitive>
  );
}

export { Rating, RatingItem, useRating };
