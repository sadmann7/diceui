"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

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
  if (orientation === "vertical" && ["ArrowLeft", "ArrowRight"].includes(key))
    return undefined;
  if (orientation === "horizontal" && ["ArrowUp", "ArrowDown"].includes(key))
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

type ActivationMode = "automatic" | "manual";

type DataState = "inactive" | "active" | "completed";

function getDataState(
  value: string | undefined,
  itemValue: string,
  stepState: StepState | undefined,
): DataState {
  const isCompleted = stepState?.completed ?? false;
  const effectiveStepValue = stepState?.value ?? itemValue;
  const isActive = value !== undefined && value === effectiveStepValue;

  if (isCompleted) return "completed";
  if (isActive) return "active";
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
  orientation: Orientation;
  disabled: boolean;
  nonInteractive: boolean;
  loop: boolean;
  activationMode: ActivationMode;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  snapshot: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
  addStep: (value: string, completed: boolean, disabled: boolean) => void;
  removeStep: (value: string) => void;
  setStep: (value: string, updates: Partial<Omit<StepState, "value">>) => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: string) => void,
  onValueComplete?: (value: string, completed: boolean) => void,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    snapshot: () =>
      stateRef.current ?? {
        steps: new Map(),
        value: undefined,
        orientation: "horizontal",
        disabled: false,
        nonInteractive: false,
        loop: false,
        activationMode: "automatic",
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
    notify: () => {
      if (listenersRef.current) {
        for (const cb of listenersRef.current) {
          cb();
        }
      }
    },
    addStep: (value, completed, disabled) => {
      const state = stateRef.current;
      if (state) {
        const newStep: StepState = { value, completed, disabled };
        state.steps.set(value, newStep);
        store.notify();
      }
    },
    removeStep: (value) => {
      const state = stateRef.current;
      if (state) {
        state.steps.delete(value);
        store.notify();
      }
    },
    setStep: (value, updates) => {
      const state = stateRef.current;
      if (state) {
        const step = state.steps.get(value);
        if (step) {
          const updatedStep: StepState = { ...step, ...updates };
          state.steps.set(value, updatedStep);

          if ("completed" in updates && updates.completed !== step.completed) {
            onValueComplete?.(value, updates.completed ?? false);
          }

          store.notify();
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
    () => selector(store.snapshot()),
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

interface StepperContextValue {
  id: string;
  dir: Direction;
  disabled: boolean;
  nonInteractive: boolean;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
}

const StepperContext = React.createContext<StepperContextValue | null>(null);

function useStepperContext(consumerName: string) {
  const context = React.useContext(StepperContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface StepperRootProps extends React.ComponentProps<"div"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onValueComplete?: (value: string, completed: boolean) => void;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
  activationMode?: ActivationMode;
  dir?: Direction;
  orientation?: Orientation;
  asChild?: boolean;
  disabled?: boolean;
  loop?: boolean;
  nonInteractive?: boolean;
  name?: string;
  label?: string;
}

function StepperRoot(props: StepperRootProps) {
  const {
    value,
    defaultValue,
    activationMode = "automatic",
    orientation = "horizontal",
    disabled = false,
    loop = false,
    nonInteractive = false,
    onValueChange,
    onValueComplete,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    steps: new Map(),
    value: value ?? defaultValue,
    orientation,
    disabled,
    nonInteractive,
    loop,
    activationMode,
  }));

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef, onValueChange, onValueComplete),
    [listenersRef, stateRef, onValueChange, onValueComplete],
  );

  return (
    <StoreContext.Provider value={store}>
      <StepperRootImpl {...rootProps} />
    </StoreContext.Provider>
  );
}

function StepperRootImpl(props: StepperRootProps) {
  const {
    value: valueProp,
    onValueAdd,
    onValueRemove,
    id: idProp,
    dir: dirProp,
    orientation = "horizontal",
    asChild = false,
    disabled = false,
    nonInteractive = false,
    name,
    label,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);
  const store = useStoreContext("StepperImpl");

  const id = React.useId();
  const labelId = React.useId();

  const rootId = idProp ?? id;

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setFormTrigger);
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  React.useEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  const value = useStore((state) => state.value);

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      id: rootId,
      dir,
      disabled,
      nonInteractive,
      onValueAdd,
      onValueRemove,
    }),
    [rootId, dir, disabled, nonInteractive, onValueAdd, onValueRemove],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StepperContext.Provider value={contextValue}>
      <RootPrimitive
        id={rootId}
        aria-labelledby={labelId ?? undefined}
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper"
        dir={dir}
        {...rootProps}
        ref={composedRef}
        className={cn("flex flex-col gap-6", className)}
      >
        {label && (
          <span id={labelId} className="sr-only">
            {label}
          </span>
        )}
        {children}
      </RootPrimitive>
      {isFormControl && (
        <VisuallyHiddenInput
          type="hidden"
          control={formTrigger}
          name={name}
          value={value}
          disabled={disabled}
        />
      )}
    </StepperContext.Provider>
  );
}

const stepperListVariants = cva("flex gap-4 outline-none", {
  variants: {
    orientation: {
      horizontal: "flex-row items-center",
      vertical: "flex-col items-start",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

type ListElement = React.ComponentRef<typeof StepperList>;

interface StepperListProps extends React.ComponentProps<"ol"> {
  asChild?: boolean;
}

function StepperList(props: StepperListProps) {
  const { className, children, asChild, ref, ...listProps } = props;
  const context = useStepperContext(LIST_NAME);
  const orientation = useStore((state) => state.orientation);

  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const [focusableItemCount, setFocusableItemCount] = React.useState(0);
  const isClickFocusRef = React.useRef(false);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());
  const listRef = React.useRef<HTMLElement>(null);
  const composedRefs = useComposedRefs(ref, listRef);

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

  const onEntryFocus = React.useCallback(
    (event: Event) => {
      if (!event.defaultPrevented) {
        const items = Array.from(itemsRef.current.values()).filter(
          (item) => !item.disabled,
        );
        const activeItem = items.find((item) => item.active);
        const currentItem = items.find((item) => item.id === tabStopId);
        const candidateItems = [activeItem, currentItem, ...items].filter(
          Boolean,
        ) as ItemData[];
        const candidateNodes = candidateItems.map((item) => item.element);
        focusFirst(candidateNodes, false);
      }
    },
    [tabStopId],
  );

  React.useEffect(() => {
    const node = listRef.current;
    if (node) {
      node.addEventListener(ENTRY_FOCUS, onEntryFocus);
      return () => node.removeEventListener(ENTRY_FOCUS, onEntryFocus);
    }
  }, [onEntryFocus]);

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
      }
      isClickFocusRef.current = false;
    },
    [listProps.onFocus, isTabbingBackOut],
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

  const ListPrimitive = asChild ? Slot : "ol";

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
        ref={composedRefs}
        className={cn(stepperListVariants({ orientation, className }))}
        onBlur={onBlur}
        onFocus={onFocus}
        onMouseDown={onMouseDown}
      >
        {children}
      </ListPrimitive>
    </FocusContext.Provider>
  );
}

const stepperItemVariants = cva("flex w-full", {
  variants: {
    orientation: {
      horizontal: "flex-col items-center text-center",
      vertical: "flex-row items-start gap-4 text-left",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

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

interface StepperItemProps extends React.ComponentProps<"li"> {
  value: string;
  completed?: boolean;
  disabled?: boolean;
  asChild?: boolean;
}

function StepperItem(props: StepperItemProps) {
  const {
    value: itemValue,
    completed = false,
    disabled = false,
    className,
    children,
    asChild,
    ref,
    ...itemProps
  } = props;

  const context = useStepperContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const orientation = useStore((state) => state.orientation);
  const value = useStore((state) => state.value);

  const onValueAdd = React.useCallback(() => {
    context.onValueAdd?.(itemValue);
  }, [context.onValueAdd, itemValue]);

  const onValueRemove = React.useCallback(() => {
    context.onValueRemove?.(itemValue);
  }, [context.onValueRemove, itemValue]);

  useIsomorphicLayoutEffect(() => {
    store.addStep(itemValue, completed, disabled);
    onValueAdd();

    return () => {
      store.removeStep(itemValue);
      onValueRemove();
    };
  }, [store, itemValue, completed, disabled, onValueAdd, onValueRemove]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(itemValue, { completed, disabled });
  }, [store, itemValue, completed, disabled]);

  const stepState = useStore((state) => state.steps.get(itemValue));
  const dataState = getDataState(value, itemValue, stepState);

  const itemContextValue = React.useMemo<StepperItemContextValue>(
    () => ({
      value: itemValue,
      stepState,
    }),
    [itemValue, stepState],
  );

  const ItemPrimitive = asChild ? Slot : "li";

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
        className={cn(stepperItemVariants({ orientation, className }))}
      >
        {children}
      </ItemPrimitive>
    </StepperItemContext.Provider>
  );
}

type TriggerElement = React.ComponentRef<typeof StepperTrigger>;

interface StepperTriggerProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
}

function StepperTrigger(props: StepperTriggerProps) {
  const {
    variant = "ghost",
    size = "icon",
    className,
    asChild = false,
    ref,
    ...triggerProps
  } = props;

  const context = useStepperContext(TRIGGER_NAME);
  const itemContext = useStepperItemContext(TRIGGER_NAME);
  const store = useStoreContext(TRIGGER_NAME);
  const focusContext = useFocusContext(TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const globalDisabled = useStore((state) => state.disabled);
  const activationMode = useStore((state) => state.activationMode);
  const orientation = useStore((state) => state.orientation);
  const loop = useStore((state) => state.loop);

  const stepItems = focusContext.getItems();
  const currentIndex = stepItems.findIndex((item) => item.value === itemValue);
  const stepPosition = currentIndex + 1;
  const stepCount = stepItems.length;

  const triggerId = getId(context.id, "trigger", itemValue);
  const contentId = getId(context.id, "content", itemValue);
  const titleId = getId(context.id, "title", itemValue);
  const descriptionId = getId(context.id, "description", itemValue);

  const isDisabled =
    globalDisabled || stepState?.disabled || triggerProps.disabled;
  const isActive = value === itemValue;
  const isTabStop = focusContext.tabStopId === triggerId;
  const dataState = getDataState(value, itemValue, stepState);

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
    (event: React.MouseEvent<TriggerElement>) => {
      triggerProps.onClick?.(event);
      if (event.defaultPrevented) return;

      if (!isDisabled && !context.nonInteractive) {
        store.setState("value", itemValue);
      }
    },
    [
      isDisabled,
      context.nonInteractive,
      store,
      itemValue,
      triggerProps.onClick,
    ],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<TriggerElement>) => {
      triggerProps.onFocus?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(triggerId);

      if (
        isArrowKeyPressedRef.current &&
        triggerElement &&
        activationMode === "automatic"
      ) {
        triggerElement.click();
      }
    },
    [
      focusContext,
      triggerId,
      triggerElement,
      activationMode,
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

        // Imperative focus during keydown is risky so we prevent React's batching updates
        queueMicrotask(() => focusFirst(candidateNodes));
      }

      triggerProps.onKeyDown?.(event as React.KeyboardEvent<HTMLButtonElement>);
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
      triggerProps.onMouseDown?.(event);
    },
    [focusContext, triggerId, isDisabled, triggerProps.onMouseDown],
  );

  const TriggerPrimitive = asChild ? Slot : Button;

  return (
    <TriggerPrimitive
      id={triggerId}
      role="tab"
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
      variant={variant}
      size={size}
      className={cn("rounded-full", className)}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onMouseDown={onMouseDown}
    />
  );
}

const stepperIndicatorVariants = cva(
  [
    "flex items-center justify-center rounded-full border-2 border-muted bg-background font-medium text-muted-foreground transition-colors",
    "data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    "data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
  ],
  {
    variants: {
      size: {
        sm: "size-6 text-xs",
        default: "size-8 text-sm",
        lg: "size-10 text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface StepperIndicatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function StepperIndicator(props: StepperIndicatorProps) {
  const { className, children, asChild, ref, ...indicatorProps } = props;
  const context = useStepperContext(INDICATOR_NAME);
  const itemContext = useStepperItemContext(INDICATOR_NAME);
  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));

  const dataState = getDataState(value, itemValue, stepState);

  const IndicatorPrimitive = asChild ? Slot : "div";

  return (
    <IndicatorPrimitive
      data-state={dataState}
      data-slot="stepper-indicator"
      dir={context.dir}
      {...indicatorProps}
      ref={ref}
      className={cn(stepperIndicatorVariants({ className }))}
    >
      {stepState?.completed ? <Check className="size-4" /> : children}
    </IndicatorPrimitive>
  );
}

const stepperSeparatorVariants = cva(
  "bg-border transition-colors data-[state=active]:bg-primary data-[state=completed]:bg-primary",
  {
    variants: {
      orientation: {
        horizontal: "mx-2 h-px w-full",
        vertical: "mr-1 ml-3 h-8 w-px",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

interface StepperSeparatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
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
  const focusContext = useFocusContext(SEPARATOR_NAME);
  const value = useStore((state) => state.value);
  const orientation = useStore((state) => state.orientation);

  const stepItems = focusContext.getItems();
  const currentIndex = stepItems.findIndex(
    (item) => item.value === itemContext.value,
  );
  const isLastItem = currentIndex === stepItems.length - 1;

  if (isLastItem && !forceMount) {
    return null;
  }

  const dataState = getDataState(
    value,
    itemContext.value,
    itemContext.stepState,
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
      className={cn(stepperSeparatorVariants({ orientation, className }))}
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

interface StepperContentProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const { value: valueProp, asChild, ref, ...contentProps } = props;

  const context = useStepperContext(CONTENT_NAME);
  const value = useStore((state) => state.value);

  const contentId = getId(context.id, "content", valueProp);
  const triggerId = getId(context.id, "trigger", valueProp);

  if (valueProp !== value) return null;

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
    />
  );
}

export {
  StepperContent as Content,
  StepperDescription as Description,
  StepperItem as Item,
  StepperIndicator as ItemIndicator,
  StepperList as List,
  StepperRoot as Root,
  StepperSeparator as Separator,
  StepperTitle as Title,
  StepperTrigger as Trigger,
  //
  StepperRoot as Stepper,
  StepperContent,
  StepperDescription,
  StepperItem,
  StepperIndicator,
  StepperList,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  //
  useStore as useStepper,
};
