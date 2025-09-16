"use client";

import { Slot } from "@radix-ui/react-slot";
import { Check } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Stepper";
const LIST_NAME = "StepperList";
const ITEM_NAME = "StepperItem";
const TRIGGER_NAME = "StepperTrigger";
const INDICATOR_NAME = "StepperIndicator";
const SEPARATOR_NAME = "StepperSeparator";
const TITLE_NAME = "StepperTitle";
const DESCRIPTION_NAME = "StepperDescription";
const CONTENT_NAME = "StepperContent";

const ENTRY_FOCUS = "stepperFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

function getId(
  id: string,
  variant: "trigger" | "content" | "title" | "description",
  value: string,
) {
  return `${id}-${variant}-${value}`;
}

type FocusIntent = "first" | "last" | "prev" | "next";

const MAP_KEY_TO_FOCUS_INTENT: Record<string, FocusIntent> = {
  ArrowLeft: "prev",
  ArrowUp: "prev",
  ArrowRight: "next",
  ArrowDown: "next",
  PageUp: "first",
  Home: "first",
  PageDown: "last",
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
  event: React.KeyboardEvent<TriggerElement>,
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

function focusFirst(candidates: HTMLElement[], preventScroll = false) {
  const PREVIOUSLY_FOCUSED_ELEMENT = document.activeElement;
  for (const candidate of candidates) {
    if (candidate === PREVIOUSLY_FOCUSED_ELEMENT) return;
    candidate.focus({ preventScroll });
    if (document.activeElement !== PREVIOUSLY_FOCUSED_ELEMENT) return;
  }
}

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T,
  );
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

type Direction = "ltr" | "rtl";

type Orientation = "horizontal" | "vertical";

type NavigationDirection = "next" | "prev";

type ActivationMode = "automatic" | "manual";

type DataState = "inactive" | "active" | "completed";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function getDataState(
  value: string | undefined,
  itemValue: string,
  stepState: StepState | undefined,
  steps: Map<string, StepState>,
  variant: "item" | "separator" = "item",
): DataState {
  const stepKeys = Array.from(steps.keys());
  const currentIndex = stepKeys.indexOf(itemValue);

  if (stepState?.completed) return "completed";

  if (value === itemValue) {
    return variant === "separator" ? "inactive" : "active";
  }

  if (value) {
    const activeIndex = stepKeys.indexOf(value);

    if (activeIndex > currentIndex) return "completed";
  }

  return "inactive";
}

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface StepState {
  value: string;
  completed: boolean;
  disabled: boolean;
}

interface StoreState {
  steps: Map<string, StepState>;
  value?: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  setStateWithValidation: (
    value: string,
    direction: NavigationDirection,
  ) => Promise<boolean>;
  notify: () => void;
  addStep: (value: string, completed: boolean, disabled: boolean) => void;
  removeStep: (value: string) => void;
  setStep: (value: string, completed: boolean, disabled: boolean) => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: string) => void,
  onValueComplete?: (value: string, completed: boolean) => void,
  onValueAdd?: (value: string) => void,
  onValueRemove?: (value: string) => void,
  onValidate?: (
    value: string,
    direction: NavigationDirection,
  ) => boolean | Promise<boolean>,
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
        steps: new Map(),
        value: undefined,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (key === "value" && typeof value === "string") {
        state.value = value;
        onValueChange?.(value);
      } else {
        state[key] = value;
      }

      store.notify();
    },
    setStateWithValidation: async (value, direction) => {
      if (!onValidate) {
        store.setState("value", value);
        return true;
      }

      try {
        const isValid = await onValidate(value, direction);
        if (isValid) {
          store.setState("value", value);
        }
        return isValid;
      } catch {
        return false;
      }
    },
    addStep: (value, completed, disabled) => {
      const state = stateRef.current;
      if (state) {
        const newStep: StepState = { value, completed, disabled };
        state.steps.set(value, newStep);
        onValueAdd?.(value);
        store.notify();
      }
    },
    removeStep: (value) => {
      const state = stateRef.current;
      if (state) {
        state.steps.delete(value);
        onValueRemove?.(value);
        store.notify();
      }
    },
    setStep: (value, completed, disabled) => {
      const state = stateRef.current;
      if (state) {
        const step = state.steps.get(value);
        if (step) {
          const updatedStep: StepState = { ...step, completed, disabled };
          state.steps.set(value, updatedStep);

          if (completed !== step.completed) {
            onValueComplete?.(value, completed);
          }

          store.notify();
        }
      }
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
  element: HTMLElement;
  value: string;
  active: boolean;
  disabled: boolean;
}

interface StepperContextValue {
  id: string;
  dir: Direction;
  orientation: Orientation;
  activationMode: ActivationMode;
  disabled: boolean;
  nonInteractive: boolean;
  loop: boolean;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext(consumerName: string) {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface StepperRootProps extends DivProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValueComplete?: (value: string, completed: boolean) => void;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
  onValidate?: (
    value: string,
    direction: NavigationDirection,
  ) => boolean | Promise<boolean>;
  activationMode?: ActivationMode;
  dir?: Direction;
  orientation?: Orientation;
  disabled?: boolean;
  loop?: boolean;
  nonInteractive?: boolean;
}

function StepperRoot(props: StepperRootProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueAdd,
    onValueRemove,
    onValidate,
    id: idProp,
    dir: dirProp,
    orientation = "horizontal",
    activationMode = "automatic",
    asChild,
    disabled = false,
    nonInteractive = false,
    loop = false,
    className,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    steps: new Map(),
    value: value ?? defaultValue,
  }));

  const store = React.useMemo(
    () =>
      createStore(
        listenersRef,
        stateRef,
        onValueChange,
        onValueComplete,
        onValueAdd,
        onValueRemove,
        onValidate,
      ),
    [
      listenersRef,
      stateRef,
      onValueChange,
      onValueComplete,
      onValueAdd,
      onValueRemove,
      onValidate,
    ],
  );

  React.useEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value, store]);

  const dir = useDirection(dirProp);

  const id = React.useId();

  const rootId = idProp ?? id;

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      id: rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      nonInteractive,
      loop,
    }),
    [rootId, dir, orientation, activationMode, disabled, nonInteractive, loop],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <StepperContext.Provider value={contextValue}>
        <RootPrimitive
          id={rootId}
          data-disabled={disabled ? "" : undefined}
          data-orientation={orientation}
          data-slot="stepper"
          dir={dir}
          {...rootProps}
          className={cn(
            "flex gap-6",
            orientation === "horizontal" ? "flex-col" : "flex-row",
            className,
          )}
        />
      </StepperContext.Provider>
    </StoreContext.Provider>
  );
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
    throw new Error(`\`${consumerName}\` must be used within a focus provider`);
  }
  return context;
}

type ListElement = React.ComponentRef<typeof StepperList>;

interface StepperListProps extends DivProps {
  asChild?: boolean;
}

function StepperList(props: StepperListProps) {
  const { className, children, asChild, ref, ...listProps } = props;

  const context = useStepperContext(LIST_NAME);
  const orientation = context.orientation;
  const currentValue = useStore((state) => state.value);

  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const [focusableItemCount, setFocusableItemCount] = React.useState(0);
  const isClickFocusRef = React.useRef(false);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());
  const listRef = React.useRef<HTMLElement>(null);
  const composedRef = useComposedRefs(ref, listRef);

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
    return Array.from(itemsRef.current.values()).sort((a, b) => {
      const position = a.element.compareDocumentPosition(b.element);
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
    (event: React.FocusEvent<ListElement>) => {
      listProps.onBlur?.(event);
      if (event.defaultPrevented) return;

      setIsTabbingBackOut(false);
    },
    [listProps.onBlur],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ListElement>) => {
      listProps.onFocus?.(event);
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
          const selectedItem = currentValue
            ? items.find((item) => item.value === currentValue)
            : undefined;
          const activeItem = items.find((item) => item.active);
          const currentItem = items.find((item) => item.id === tabStopId);

          const candidateItems = [
            selectedItem,
            activeItem,
            currentItem,
            ...items,
          ].filter(Boolean) as ItemData[];
          const candidateNodes = candidateItems.map((item) => item.element);
          focusFirst(candidateNodes, false);
        }
      }
      isClickFocusRef.current = false;
    },
    [listProps.onFocus, isTabbingBackOut, currentValue, tabStopId],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<ListElement>) => {
      listProps.onMouseDown?.(event);

      if (event.defaultPrevented) return;

      isClickFocusRef.current = true;
    },
    [listProps.onMouseDown],
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

  const ListPrimitive = asChild ? Slot : "div";

  return (
    <FocusContext.Provider value={focusContextValue}>
      <ListPrimitive
        role="tablist"
        aria-orientation={orientation}
        data-orientation={orientation}
        data-slot="stepper-list"
        dir={context.dir}
        tabIndex={isTabbingBackOut || focusableItemCount === 0 ? -1 : 0}
        {...listProps}
        ref={composedRef}
        className={cn(
          "flex outline-none",
          orientation === "horizontal"
            ? "flex-row items-center"
            : "flex-col items-start",
          className,
        )}
        onBlur={onBlur}
        onFocus={onFocus}
        onMouseDown={onMouseDown}
      >
        {children}
      </ListPrimitive>
    </FocusContext.Provider>
  );
}

interface StepperItemContextValue {
  value: string;
  stepState: StepState | undefined;
}

const StepperItemContext = React.createContext<StepperItemContextValue | null>(
  null,
);

function useStepperItemContext(consumerName: string) {
  const context = React.useContext(StepperItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

interface StepperItemProps extends DivProps {
  value: string;
  completed?: boolean;
  disabled?: boolean;
}

function StepperItem(props: StepperItemProps) {
  const {
    value: itemValue,
    completed = false,
    disabled = false,
    asChild,
    className,
    children,
    ref,
    ...itemProps
  } = props;

  const context = useStepperContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const orientation = context.orientation;
  const value = useStore((state) => state.value);

  useIsomorphicLayoutEffect(() => {
    store.addStep(itemValue, completed, disabled);

    return () => {
      store.removeStep(itemValue);
    };
  }, [store, itemValue, completed, disabled]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(itemValue, completed, disabled);
  }, [store, itemValue, completed, disabled]);

  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);
  const dataState = getDataState(value, itemValue, stepState, steps);

  const itemContextValue = React.useMemo<StepperItemContextValue>(
    () => ({
      value: itemValue,
      stepState,
    }),
    [itemValue, stepState],
  );

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <StepperItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        data-disabled={stepState?.disabled ? "" : undefined}
        data-orientation={orientation}
        data-state={dataState}
        data-slot="stepper-item"
        dir={context.dir}
        {...itemProps}
        ref={ref}
        className={cn(
          "relative flex not-last:flex-1 items-center",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        )}
      >
        {children}
      </ItemPrimitive>
    </StepperItemContext.Provider>
  );
}

type TriggerElement = React.ComponentRef<typeof StepperTrigger>;

interface StepperTriggerProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function StepperTrigger(props: StepperTriggerProps) {
  const { asChild, className, ref, ...triggerProps } = props;

  const context = useStepperContext(TRIGGER_NAME);
  const itemContext = useStepperItemContext(TRIGGER_NAME);
  const store = useStoreContext(TRIGGER_NAME);
  const focusContext = useFocusContext(TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const activationMode = context.activationMode;
  const orientation = context.orientation;
  const loop = context.loop;

  const steps = useStore((state) => state.steps);
  const stepIndex = Array.from(steps.keys()).indexOf(itemValue);

  const stepPosition = stepIndex + 1;
  const stepCount = steps.size;

  const triggerId = getId(context.id, "trigger", itemValue);
  const contentId = getId(context.id, "content", itemValue);
  const titleId = getId(context.id, "title", itemValue);
  const descriptionId = getId(context.id, "description", itemValue);

  const isDisabled =
    context.disabled || stepState?.disabled || triggerProps.disabled;
  const isActive = value === itemValue;
  const isTabStop = focusContext.tabStopId === triggerId;
  const dataState = getDataState(value, itemValue, stepState, steps);

  const [triggerElement, setTriggerElement] =
    React.useState<HTMLElement | null>(null);
  const composedRef = useComposedRefs(ref, setTriggerElement);
  const isArrowKeyPressedRef = React.useRef(false);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (ARROW_KEYS.includes(event.key)) {
        isArrowKeyPressedRef.current = true;
      }
    }
    function onKeyUp() {
      isArrowKeyPressedRef.current = false;
    }
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  React.useEffect(() => {
    if (triggerElement) {
      focusContext.onItemRegister({
        id: triggerId,
        element: triggerElement,
        value: itemValue,
        active: isTabStop,
        disabled: !!isDisabled,
      });

      if (!isDisabled) {
        focusContext.onFocusableItemAdd();
      }

      return () => {
        focusContext.onItemUnregister(triggerId);
        if (!isDisabled) {
          focusContext.onFocusableItemRemove();
        }
      };
    }
  }, [
    triggerElement,
    focusContext,
    triggerId,
    itemValue,
    isTabStop,
    isDisabled,
  ]);

  const onClick = React.useCallback(
    async (event: React.MouseEvent<TriggerElement>) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !context.nonInteractive) {
        const currentStepIndex = Array.from(steps.keys()).indexOf(value ?? "");
        const targetStepIndex = Array.from(steps.keys()).indexOf(itemValue);
        const direction = targetStepIndex > currentStepIndex ? "next" : "prev";

        await store.setStateWithValidation(itemValue, direction);
      }
    },
    [
      isDisabled,
      context.nonInteractive,
      store,
      itemValue,
      value,
      steps,
      triggerProps.onClick,
    ],
  );

  const onFocus = React.useCallback(
    async (event: React.FocusEvent<TriggerElement>) => {
      triggerProps.onFocus?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(triggerId);

      if (
        !isActive &&
        !isDisabled &&
        activationMode !== "manual" &&
        !context.nonInteractive
      ) {
        const currentStepIndex = Array.from(steps.keys()).indexOf(value || "");
        const targetStepIndex = Array.from(steps.keys()).indexOf(itemValue);
        const direction = targetStepIndex > currentStepIndex ? "next" : "prev";

        await store.setStateWithValidation(itemValue, direction);
      }
    },
    [
      focusContext,
      triggerId,
      activationMode,
      isActive,
      isDisabled,
      context.nonInteractive,
      store,
      itemValue,
      value,
      steps,
      triggerProps.onFocus,
    ],
  );

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<TriggerElement>) => {
      triggerProps.onKeyDown?.(event);
      if (event.defaultPrevented) return;

      if (event.key === "Enter" && context.nonInteractive) {
        event.preventDefault();
        return;
      }

      if (
        (event.key === "Enter" || event.key === " ") &&
        activationMode === "manual" &&
        !context.nonInteractive
      ) {
        event.preventDefault();
        if (!isDisabled && triggerElement) {
          triggerElement.click();
        }
        return;
      }

      if (event.key === "Tab" && event.shiftKey) {
        focusContext.onItemShiftTab();
        return;
      }

      if (event.target !== event.currentTarget) return;

      const focusIntent = getFocusIntent(event, context.dir, orientation);

      if (focusIntent !== undefined) {
        if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey)
          return;
        event.preventDefault();

        const items = focusContext.getItems().filter((item) => !item.disabled);
        let candidateNodes = items.map((item) => item.element);

        if (focusIntent === "last") {
          candidateNodes.reverse();
        } else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") candidateNodes.reverse();
          const currentIndex = candidateNodes.indexOf(
            event.currentTarget as HTMLElement,
          );
          candidateNodes = loop
            ? wrapArray(candidateNodes, currentIndex + 1)
            : candidateNodes.slice(currentIndex + 1);
        }

        queueMicrotask(() => focusFirst(candidateNodes));
      }
    },
    [
      focusContext,
      context.nonInteractive,
      context.dir,
      activationMode,
      orientation,
      loop,
      isDisabled,
      triggerElement,
      triggerProps.onKeyDown,
    ],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      triggerProps.onMouseDown?.(event);
      if (event.defaultPrevented) return;

      if (isDisabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(triggerId);
      }
    },
    [focusContext, triggerId, isDisabled, triggerProps.onMouseDown],
  );

  const TriggerPrimitive = asChild ? Slot : "button";

  return (
    <TriggerPrimitive
      id={triggerId}
      role="tab"
      type="button"
      aria-controls={contentId}
      aria-current={isActive ? "step" : undefined}
      aria-describedby={`${titleId} ${descriptionId}`}
      aria-posinset={stepPosition}
      aria-selected={isActive}
      aria-setsize={stepCount}
      data-disabled={isDisabled ? "" : undefined}
      data-state={dataState}
      data-slot="stepper-trigger"
      disabled={isDisabled}
      tabIndex={isTabStop ? 0 : -1}
      {...triggerProps}
      ref={composedRef}
      className={cn(
        "inline-flex items-center justify-center gap-3 rounded-md text-left outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        "not-has-[[data-slot=description]]:rounded-full not-has-[[data-slot=title]]:rounded-full",
        className,
      )}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
    />
  );
}

interface StepperIndicatorProps extends Omit<DivProps, "children"> {
  children?: React.ReactNode | ((dataState: DataState) => React.ReactNode);
}

function StepperIndicator(props: StepperIndicatorProps) {
  const { className, children, asChild, ref, ...indicatorProps } = props;
  const context = useStepperContext(INDICATOR_NAME);
  const itemContext = useStepperItemContext(INDICATOR_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);

  const stepPosition = Array.from(steps.keys()).indexOf(itemValue) + 1;

  const dataState = getDataState(value, itemValue, stepState, steps);

  const IndicatorPrimitive = asChild ? Slot : "div";

  return (
    <IndicatorPrimitive
      data-state={dataState}
      data-slot="stepper-indicator"
      dir={context.dir}
      {...indicatorProps}
      ref={ref}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background font-medium text-muted-foreground text-sm transition-colors data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
        className,
      )}
    >
      {typeof children === "function" ? (
        children(dataState)
      ) : children ? (
        children
      ) : dataState === "completed" ? (
        <Check className="size-4" />
      ) : (
        stepPosition
      )}
    </IndicatorPrimitive>
  );
}

interface StepperSeparatorProps extends DivProps {
  forceMount?: boolean;
}

function StepperSeparator(props: StepperSeparatorProps) {
  const {
    className,
    asChild,
    forceMount = false,
    ref,
    ...separatorProps
  } = props;

  const context = useStepperContext(SEPARATOR_NAME);
  const itemContext = useStepperItemContext(SEPARATOR_NAME);
  const value = useStore((state) => state.value);
  const orientation = context.orientation;

  const steps = useStore((state) => state.steps);
  const stepIndex = Array.from(steps.keys()).indexOf(itemContext.value);

  const isLastStep = stepIndex === steps.size - 1;

  if (isLastStep && !forceMount) {
    return null;
  }

  const dataState = getDataState(
    value,
    itemContext.value,
    itemContext.stepState,
    steps,
    "separator",
  );

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      role="separator"
      aria-hidden="true"
      aria-orientation={orientation}
      data-orientation={orientation}
      data-state={dataState}
      data-slot="stepper-separator"
      dir={context.dir}
      {...separatorProps}
      ref={ref}
      className={cn(
        "bg-border transition-colors data-[state=active]:bg-primary data-[state=completed]:bg-primary",
        orientation === "horizontal" ? "h-px flex-1" : "h-10 w-px",
        className,
      )}
    />
  );
}

interface StepperTitleProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperTitle(props: StepperTitleProps) {
  const { className, asChild, ref, ...titleProps } = props;

  const context = useStepperContext(TITLE_NAME);
  const itemContext = useStepperItemContext(TITLE_NAME);

  const titleId = getId(context.id, "title", itemContext.value);

  const TitlePrimitive = asChild ? Slot : "span";

  return (
    <TitlePrimitive
      id={titleId}
      data-slot="title"
      dir={context.dir}
      {...titleProps}
      ref={ref}
      className={cn("font-medium text-sm", className)}
    />
  );
}

interface StepperDescriptionProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperDescription(props: StepperDescriptionProps) {
  const { className, asChild, ref, ...descriptionProps } = props;
  const context = useStepperContext(DESCRIPTION_NAME);
  const itemContext = useStepperItemContext(DESCRIPTION_NAME);

  const descriptionId = getId(context.id, "description", itemContext.value);

  const DescriptionPrimitive = asChild ? Slot : "span";

  return (
    <DescriptionPrimitive
      id={descriptionId}
      data-slot="description"
      dir={context.dir}
      {...descriptionProps}
      ref={ref}
      className={cn("text-muted-foreground text-xs", className)}
    />
  );
}

interface StepperContentProps extends DivProps {
  value: string;
  forceMount?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const {
    value: valueProp,
    asChild,
    forceMount = false,
    ref,
    className,
    ...contentProps
  } = props;

  const context = useStepperContext(CONTENT_NAME);
  const value = useStore((state) => state.value);

  const contentId = getId(context.id, "content", valueProp);
  const triggerId = getId(context.id, "trigger", valueProp);

  if (valueProp !== value && !forceMount) return null;

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      id={contentId}
      role="tabpanel"
      aria-labelledby={triggerId}
      data-slot="stepper-content"
      dir={context.dir}
      {...contentProps}
      ref={ref}
      className={cn("flex-1 outline-none", className)}
    />
  );
}

export {
  StepperRoot as Root,
  StepperList as List,
  StepperItem as Item,
  StepperTrigger as Trigger,
  StepperIndicator as ItemIndicator,
  StepperSeparator as Separator,
  StepperTitle as Title,
  StepperDescription as Description,
  StepperContent as Content,
  //
  StepperRoot as Stepper,
  StepperList,
  StepperItem,
  StepperTrigger,
  StepperIndicator,
  StepperSeparator,
  StepperTitle,
  StepperDescription,
  StepperContent,
  //
  useStore as useStepper,
  //
  type StepperRootProps as StepperProps,
};
