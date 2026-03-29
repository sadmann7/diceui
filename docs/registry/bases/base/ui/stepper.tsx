"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { Check } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/base/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/base/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/base/hooks/use-lazy-ref";
import { useComposedRefs } from "@/registry/bases/base/lib/compose-refs";
import { useDirection } from "@/registry/bases/base/ui/direction";

const ROOT_NAME = "Stepper";
const LIST_NAME = "StepperList";
const ITEM_NAME = "StepperItem";
const TRIGGER_NAME = "StepperTrigger";
const INDICATOR_NAME = "StepperIndicator";
const SEPARATOR_NAME = "StepperSeparator";
const TITLE_NAME = "StepperTitle";
const DESCRIPTION_NAME = "StepperDescription";
const CONTENT_NAME = "StepperContent";
const PREV_NAME = "StepperPrev";
const NEXT_NAME = "StepperNext";

const ENTRY_FOCUS = "stepperFocusGroup.onEntryFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];

type Direction = "ltr" | "rtl";
type Orientation = "horizontal" | "vertical";
type NavigationDirection = "next" | "prev";
type ActivationMode = "automatic" | "manual";
type DataState = "inactive" | "active" | "completed";

interface DivProps
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}
interface ButtonProps
  extends React.ComponentProps<"button">,
    useRender.ComponentProps<"button"> {}

type ListElement = HTMLDivElement;
type TriggerElement = HTMLButtonElement;

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

function focusFirst(
  candidates: React.RefObject<TriggerElement | null>[],
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

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map<T>(
    (_, index) => array[(startIndex + index) % array.length] as T,
  );
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

interface StepState {
  value: string;
  completed: boolean;
  disabled: boolean;
}

interface StoreState {
  steps: Map<string, StepState>;
  value: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  setStateWithValidation: (
    value: string,
    direction: NavigationDirection,
  ) => Promise<boolean>;
  hasValidation: () => boolean;
  notify: () => void;
  addStep: (value: string, completed: boolean, disabled: boolean) => void;
  removeStep: (value: string) => void;
  setStep: (value: string, completed: boolean, disabled: boolean) => void;
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
  ref: React.RefObject<TriggerElement | null>;
  value: string;
  active: boolean;
  disabled: boolean;
}

interface StepperContextValue {
  rootId: string;
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

interface StepperProps extends DivProps {
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

function Stepper(props: StepperProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueAdd,
    onValueRemove,
    onValidate,
    dir: dirProp,
    orientation = "horizontal",
    activationMode = "automatic",
    render,
    disabled = false,
    nonInteractive = false,
    loop = false,
    className,
    id,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    steps: new Map(),
    value: value ?? defaultValue ?? "",
  }));

  const propsRef = useAsRef({
    onValueChange,
    onValueComplete,
    onValueAdd,
    onValueRemove,
    onValidate,
  });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "value" && typeof value === "string") {
          stateRef.current.value = value;
          propsRef.current.onValueChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      setStateWithValidation: async (value, direction) => {
        if (!propsRef.current.onValidate) {
          store.setState("value", value);
          return true;
        }

        try {
          const isValid = await propsRef.current.onValidate(value, direction);
          if (isValid) {
            store.setState("value", value);
          }
          return isValid;
        } catch {
          return false;
        }
      },
      hasValidation: () => !!propsRef.current.onValidate,
      addStep: (value, completed, disabled) => {
        const newStep: StepState = { value, completed, disabled };
        stateRef.current.steps.set(value, newStep);
        propsRef.current.onValueAdd?.(value);
        store.notify();
      },
      removeStep: (value) => {
        stateRef.current.steps.delete(value);
        propsRef.current.onValueRemove?.(value);
        store.notify();
      },
      setStep: (value, completed, disabled) => {
        const step = stateRef.current.steps.get(value);
        if (step) {
          const updatedStep: StepState = { ...step, completed, disabled };
          stateRef.current.steps.set(value, updatedStep);

          if (completed !== step.completed) {
            propsRef.current.onValueComplete?.(value, completed);
          }

          store.notify();
        }
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  useIsomorphicLayoutEffect(() => {
    if (value !== undefined) {
      store.setState("value", value);
    }
  }, [value]);

  const contextDir = useDirection();
  const dir = dirProp ?? contextDir;

  const instanceId = React.useId();
  const rootId = id ?? instanceId;

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      rootId,
      dir,
      orientation,
      activationMode,
      disabled,
      nonInteractive,
      loop,
    }),
    [rootId, dir, orientation, activationMode, disabled, nonInteractive, loop],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id: rootId,
        dir,
        className: cn(
          "flex gap-6",
          orientation === "horizontal" ? "w-full flex-col" : "flex-row",
          className,
        ),
      },
      rootProps,
    ),
    render,
    state: {
      slot: "stepper",
      disabled: disabled ? "" : undefined,
      orientation,
    },
  });

  return (
    <StoreContext.Provider value={store}>
      <StepperContext.Provider value={contextValue}>
        {element}
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
    throw new Error(
      `\`${consumerName}\` must be used within \`FocusProvider\``,
    );
  }
  return context;
}

function StepperList(props: DivProps) {
  const {
    render,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onMouseDown: onMouseDownProp,
    className,
    children,
    ref,
    ...listProps
  } = props;

  const context = useStepperContext(LIST_NAME);
  const orientation = context.orientation;
  const currentValue = useStore((state) => state.value);

  const propsRef = useAsRef({
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    onMouseDown: onMouseDownProp,
  });

  const [tabStopId, setTabStopId] = React.useState<string | null>(null);
  const [isTabbingBackOut, setIsTabbingBackOut] = React.useState(false);
  const [focusableItemCount, setFocusableItemCount] = React.useState(0);
  const isClickFocusRef = React.useRef(false);
  const itemsRef = React.useRef<Map<string, ItemData>>(new Map());
  const listRef = React.useRef<ListElement>(null);
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
    (event: React.FocusEvent<ListElement>) => {
      propsRef.current.onBlur?.(event);
      if (event.defaultPrevented) return;

      setIsTabbingBackOut(false);
    },
    [propsRef],
  );

  const onFocus = React.useCallback(
    (event: React.FocusEvent<ListElement>) => {
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
          const candidateRefs = candidateItems.map((item) => item.ref);
          focusFirst(candidateRefs, false);
        }
      }
      isClickFocusRef.current = false;
    },
    [propsRef, isTabbingBackOut, currentValue, tabStopId],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<ListElement>) => {
      propsRef.current.onMouseDown?.(event);

      if (event.defaultPrevented) return;

      isClickFocusRef.current = true;
    },
    [propsRef],
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

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "tablist",
        "aria-orientation": orientation,
        dir: context.dir,
        tabIndex: isTabbingBackOut || focusableItemCount === 0 ? -1 : 0,
        ref: composedRef,
        className: cn(
          "flex outline-none",
          orientation === "horizontal"
            ? "flex-row items-center"
            : "flex-col items-start",
          className,
        ),
        onBlur,
        onFocus,
        onMouseDown,
        children,
      },
      listProps,
    ),
    render,
    state: {
      slot: "stepper-list",
      orientation,
    },
  });

  return (
    <FocusContext.Provider value={focusContextValue}>
      {element}
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
    render,
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
  }, [itemValue, completed, disabled]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(itemValue, completed, disabled);
  }, [itemValue, completed, disabled]);

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

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir: context.dir,
        ref,
        className: cn(
          "relative flex not-last:flex-1 items-center",
          orientation === "horizontal" ? "flex-row" : "flex-col",
          className,
        ),
        children,
      },
      itemProps,
    ),
    render,
    state: {
      slot: "stepper-item",
      disabled: stepState?.disabled ? "" : undefined,
      orientation,
      state: dataState,
    },
  });

  return (
    <StepperItemContext.Provider value={itemContextValue}>
      {element}
    </StepperItemContext.Provider>
  );
}

function StepperTrigger(props: ButtonProps) {
  const {
    render,
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
    disabled,
    className,
    ref,
    ...triggerProps
  } = props;

  const context = useStepperContext(TRIGGER_NAME);
  const itemContext = useStepperItemContext(TRIGGER_NAME);
  const itemValue = itemContext.value;

  const store = useStoreContext(TRIGGER_NAME);
  const focusContext = useFocusContext(TRIGGER_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);
  const stepState = useStore((state) => state.steps.get(itemValue));

  const propsRef = useAsRef({
    onClick: onClickProp,
    onFocus: onFocusProp,
    onKeyDown: onKeyDownProp,
    onMouseDown: onMouseDownProp,
  });

  const activationMode = context.activationMode;
  const orientation = context.orientation;
  const loop = context.loop;

  const stepIndex = Array.from(steps.keys()).indexOf(itemValue);

  const stepPosition = stepIndex + 1;
  const stepCount = steps.size;

  const triggerId = getId(context.rootId, "trigger", itemValue);
  const contentId = getId(context.rootId, "content", itemValue);
  const titleId = getId(context.rootId, "title", itemValue);
  const descriptionId = getId(context.rootId, "description", itemValue);

  const isDisabled = disabled || stepState?.disabled || context.disabled;
  const isActive = value === itemValue;
  const isTabStop = focusContext.tabStopId === triggerId;
  const dataState = getDataState(value, itemValue, stepState, steps);

  const triggerRef = React.useRef<TriggerElement>(null);
  const composedRef = useComposedRefs(ref, triggerRef);
  const isArrowKeyPressedRef = React.useRef(false);
  const isMouseClickRef = React.useRef(false);

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

  useIsomorphicLayoutEffect(() => {
    focusContext.onItemRegister({
      id: triggerId,
      ref: triggerRef,
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
  }, [focusContext, triggerId, itemValue, isTabStop, isDisabled]);

  const onClick = React.useCallback(
    async (event: React.MouseEvent<TriggerElement>) => {
      propsRef.current.onClick?.(event);
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
      propsRef,
    ],
  );

  const onFocus = React.useCallback(
    async (event: React.FocusEvent<TriggerElement>) => {
      propsRef.current.onFocus?.(event);
      if (event.defaultPrevented) return;

      focusContext.onItemFocus(triggerId);

      const isKeyboardFocus = !isMouseClickRef.current;

      if (
        !isActive &&
        !isDisabled &&
        activationMode !== "manual" &&
        !context.nonInteractive &&
        isKeyboardFocus
      ) {
        const currentStepIndex = Array.from(steps.keys()).indexOf(value || "");
        const targetStepIndex = Array.from(steps.keys()).indexOf(itemValue);
        const direction = targetStepIndex > currentStepIndex ? "next" : "prev";

        await store.setStateWithValidation(itemValue, direction);
      }

      isMouseClickRef.current = false;
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
      propsRef,
    ],
  );

  const onKeyDown = React.useCallback(
    async (event: React.KeyboardEvent<TriggerElement>) => {
      propsRef.current.onKeyDown?.(event);
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
        if (!isDisabled && triggerRef.current) {
          triggerRef.current.click();
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
        let candidateRefs = items.map((item) => item.ref);

        if (focusIntent === "last") {
          candidateRefs.reverse();
        } else if (focusIntent === "prev" || focusIntent === "next") {
          if (focusIntent === "prev") candidateRefs.reverse();
          const currentIndex = candidateRefs.findIndex(
            (ref) => ref.current === event.currentTarget,
          );
          candidateRefs = loop
            ? wrapArray(candidateRefs, currentIndex + 1)
            : candidateRefs.slice(currentIndex + 1);
        }

        if (store.hasValidation() && candidateRefs.length > 0) {
          const nextRef = candidateRefs[0];
          const nextElement = nextRef?.current;
          const nextItem = items.find(
            (item) => item.ref.current === nextElement,
          );

          if (nextItem && nextItem.value !== itemValue) {
            const currentStepIndex = Array.from(steps.keys()).indexOf(
              value || "",
            );
            const targetStepIndex = Array.from(steps.keys()).indexOf(
              nextItem.value,
            );
            const direction: NavigationDirection =
              targetStepIndex > currentStepIndex ? "next" : "prev";

            if (direction === "next") {
              const isValid = await store.setStateWithValidation(
                nextItem.value,
                direction,
              );
              if (!isValid) return;
            } else {
              store.setState("value", nextItem.value);
            }

            queueMicrotask(() => nextElement?.focus());
            return;
          }
        }

        queueMicrotask(() => focusFirst(candidateRefs));
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
      store,
      propsRef,
      itemValue,
      value,
      steps,
    ],
  );

  const onMouseDown = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      propsRef.current.onMouseDown?.(event);
      if (event.defaultPrevented) return;

      isMouseClickRef.current = true;

      if (isDisabled) {
        event.preventDefault();
      } else {
        focusContext.onItemFocus(triggerId);
      }
    },
    [focusContext, triggerId, isDisabled, propsRef],
  );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        id: triggerId,
        role: "tab",
        type: "button",
        "aria-controls": contentId,
        "aria-current": isActive ? "step" : undefined,
        "aria-describedby": `${titleId} ${descriptionId}`,
        "aria-posinset": stepPosition,
        "aria-selected": isActive,
        "aria-setsize": stepCount,
        disabled: isDisabled,
        tabIndex: isTabStop ? 0 : -1,
        ref: composedRef,
        className: cn(
          "inline-flex items-center justify-center gap-3 rounded-md text-left outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
          "not-has-data-[slot=description]:rounded-full not-has-data-[slot=title]:rounded-full",
          className,
        ),
        onClick,
        onFocus,
        onKeyDown,
        onMouseDown,
      },
      triggerProps,
    ),
    render,
    state: {
      slot: "stepper-trigger",
      disabled: isDisabled ? "" : undefined,
      state: dataState,
    },
  });
}

interface StepperIndicatorProps
  extends Omit<DivProps, "children">,
    Omit<useRender.ComponentProps<"div">, "children"> {
  children?: React.ReactNode | ((dataState: DataState) => React.ReactNode);
}

function StepperIndicator(props: StepperIndicatorProps) {
  const { className, children, render, ref, ...indicatorProps } = props;

  const context = useStepperContext(INDICATOR_NAME);
  const itemContext = useStepperItemContext(INDICATOR_NAME);

  const value = useStore((state) => state.value);
  const itemValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(itemValue));
  const steps = useStore((state) => state.steps);

  const stepPosition = Array.from(steps.keys()).indexOf(itemValue) + 1;

  const dataState = getDataState(value, itemValue, stepState, steps);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        dir: context.dir,
        ref,
        className: cn(
          "flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-muted bg-background font-medium text-muted-foreground text-sm transition-colors data-[state=active]:border-primary data-[state=completed]:border-primary data-[state=active]:bg-primary data-[state=completed]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:text-primary-foreground",
          className,
        ),
        children:
          typeof children === "function" ? (
            children(dataState)
          ) : children ? (
            children
          ) : dataState === "completed" ? (
            <Check className="size-4" />
          ) : (
            stepPosition
          ),
      },
      indicatorProps,
    ),
    render,
    state: {
      slot: "stepper-indicator",
      state: dataState,
    },
  });
}

interface StepperSeparatorProps extends DivProps {
  forceMount?: boolean;
}

function StepperSeparator(props: StepperSeparatorProps) {
  const {
    className,
    render,
    forceMount = false,
    ref,
    ...separatorProps
  } = props;

  const context = useStepperContext(SEPARATOR_NAME);
  const itemContext = useStepperItemContext(SEPARATOR_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const orientation = context.orientation;

  const stepIndex = Array.from(steps.keys()).indexOf(itemContext.value);

  const isLastStep = stepIndex === steps.size - 1;

  const dataState = getDataState(
    value,
    itemContext.value,
    itemContext.stepState,
    steps,
    "separator",
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "separator",
        "aria-hidden": "true",
        "aria-orientation": orientation,
        dir: context.dir,
        ref,
        className: cn(
          "bg-border transition-colors data-[state=active]:bg-primary data-[state=completed]:bg-primary",
          orientation === "horizontal" ? "h-px flex-1" : "h-10 w-px",
          className,
        ),
      },
      separatorProps,
    ),
    render,
    state: {
      slot: "stepper-separator",
      orientation,
      state: dataState,
    },
  });

  if (isLastStep && !forceMount) return null;

  return element;
}

interface StepperTitleProps
  extends React.ComponentProps<"span">,
    useRender.ComponentProps<"span"> {}

function StepperTitle(props: StepperTitleProps) {
  const { className, render, ref, ...titleProps } = props;

  const context = useStepperContext(TITLE_NAME);
  const itemContext = useStepperItemContext(TITLE_NAME);

  const titleId = getId(context.rootId, "title", itemContext.value);

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        id: titleId,
        dir: context.dir,
        ref,
        className: cn("font-medium text-sm", className),
      },
      titleProps,
    ),
    render,
    state: {
      slot: "title",
    },
  });
}

interface StepperDescriptionProps
  extends React.ComponentProps<"span">,
    useRender.ComponentProps<"span"> {}

function StepperDescription(props: StepperDescriptionProps) {
  const { className, render, ref, ...descriptionProps } = props;

  const context = useStepperContext(DESCRIPTION_NAME);
  const itemContext = useStepperItemContext(DESCRIPTION_NAME);

  const descriptionId = getId(context.rootId, "description", itemContext.value);

  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        id: descriptionId,
        dir: context.dir,
        ref,
        className: cn("text-muted-foreground text-xs", className),
      },
      descriptionProps,
    ),
    render,
    state: {
      slot: "description",
    },
  });
}

interface StepperContentProps extends DivProps {
  value: string;
  forceMount?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const {
    value: valueProp,
    render,
    forceMount = false,
    ref,
    className,
    ...contentProps
  } = props;

  const context = useStepperContext(CONTENT_NAME);
  const value = useStore((state) => state.value);

  const contentId = getId(context.rootId, "content", valueProp);
  const triggerId = getId(context.rootId, "trigger", valueProp);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id: contentId,
        role: "tabpanel",
        "aria-labelledby": triggerId,
        dir: context.dir,
        ref,
        className: cn("flex-1 outline-none", className),
      },
      contentProps,
    ),
    render,
    state: {
      slot: "stepper-content",
    },
  });

  if (valueProp !== value && !forceMount) return null;

  return element;
}

function StepperPrev(props: ButtonProps) {
  const { render, onClick: onClickProp, disabled, ...prevProps } = props;

  const store = useStoreContext(PREV_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const stepKeys = Array.from(steps.keys());
  const currentIndex = value ? stepKeys.indexOf(value) : -1;
  const isDisabled = disabled || currentIndex <= 0;

  const onClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;

      const prevIndex = Math.max(currentIndex - 1, 0);
      const prevStepValue = stepKeys[prevIndex];

      if (prevStepValue) {
        store.setState("value", prevStepValue);
      }
    },
    [propsRef, isDisabled, currentIndex, stepKeys, store],
  );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        disabled: isDisabled,
        onClick,
      },
      prevProps,
    ),
    render,
    state: {
      slot: "stepper-prev",
    },
  });
}

function StepperNext(props: ButtonProps) {
  const { render, onClick: onClickProp, disabled, ...nextProps } = props;

  const store = useStoreContext(NEXT_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const propsRef = useAsRef({
    onClick: onClickProp,
  });

  const stepKeys = Array.from(steps.keys());
  const currentIndex = value ? stepKeys.indexOf(value) : -1;
  const isDisabled = disabled || currentIndex >= stepKeys.length - 1;

  const onClick = React.useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || isDisabled) return;

      const nextIndex = Math.min(currentIndex + 1, stepKeys.length - 1);
      const nextStepValue = stepKeys[nextIndex];

      if (nextStepValue) {
        await store.setStateWithValidation(nextStepValue, "next");
      }
    },
    [propsRef, isDisabled, currentIndex, stepKeys, store],
  );

  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        type: "button",
        disabled: isDisabled,
        onClick,
      },
      nextProps,
    ),
    render,
    state: {
      slot: "stepper-next",
    },
  });
}

export {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperList,
  StepperNext,
  StepperPrev,
  //
  type StepperProps,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
  //
  useStore as useStepper,
};
