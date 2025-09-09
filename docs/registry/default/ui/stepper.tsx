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

type DataState = "inactive" | "active" | "completed";

function getDataState(
  currentValue: string | undefined,
  stepState: StepState | undefined,
): DataState {
  const isCompleted = stepState?.completed ?? false;
  const isActive = currentValue === stepState?.value;

  if (isCompleted) return "completed";
  if (isActive) return "active";
  return "inactive";
}

interface StepState {
  value: string;
  completed: boolean;
  disabled: boolean;
}

interface StoreState {
  steps: Map<string, StepState>;
  currentValue?: string;
  orientation: Orientation;
  disabled: boolean;
  nonInteractive: boolean;
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
        currentValue: undefined,
        orientation: "horizontal",
        disabled: false,
        nonInteractive: false,
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;

      if (key === "currentValue") {
        state.currentValue = value as string;
        onValueChange?.(value as string);
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
          const updatedStep = { ...step, ...updates };
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

interface StepperContextValue {
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
  dir?: Direction;
  orientation?: Orientation;
  disabled?: boolean;
  nonInteractive?: boolean;
  name?: string;
  label?: string;
  asChild?: boolean;
}

function useDirection(dirProp?: Direction): Direction {
  return dirProp ?? "ltr";
}

function StepperRoot(props: StepperRootProps) {
  const {
    orientation = "horizontal",
    disabled = false,
    nonInteractive = false,
    onValueChange,
    onValueComplete,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    steps: new Map(),
    currentValue: undefined,
    orientation,
    disabled,
    nonInteractive,
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
    value: controlledValue,
    defaultValue,
    onValueAdd,
    onValueRemove,
    dir: dirProp,
    orientation = "horizontal",
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
  const isControlled = controlledValue !== undefined;

  const labelId = React.useId();

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setFormTrigger);
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  React.useEffect(() => {
    const currentValue = controlledValue ?? defaultValue;
    if (currentValue) {
      store.setState("currentValue", currentValue);
    }
  }, [controlledValue, defaultValue, store]);

  React.useEffect(() => {
    if (isControlled && controlledValue) {
      store.setState("currentValue", controlledValue);
    }
  }, [controlledValue, isControlled, store]);

  const currentValue = useStore((state) => state.currentValue);

  const contextValue = React.useMemo<StepperContextValue>(
    () => ({
      dir,
      disabled,
      nonInteractive,
      onValueAdd,
      onValueRemove,
    }),
    [dir, disabled, nonInteractive, onValueAdd, onValueRemove],
  );

  const RootPrimitive = props.asChild ? Slot : "div";

  return (
    <StepperContext.Provider value={contextValue}>
      <RootPrimitive
        ref={composedRef}
        aria-labelledby={labelId ?? undefined}
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper"
        dir={dir}
        className={cn("flex flex-col gap-4", className)}
        {...rootProps}
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
          value={currentValue}
          disabled={disabled}
        />
      )}
    </StepperContext.Provider>
  );
}

const stepperListVariants = cva("flex gap-4", {
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

interface StepperListProps extends React.ComponentProps<"ol"> {
  asChild?: boolean;
}

function StepperList(props: StepperListProps) {
  const { className, children, ref, asChild, ...listProps } = props;
  const context = useStepperContext(LIST_NAME);
  const store = useStoreContext(LIST_NAME);
  const orientation = useStore((state) => state.orientation);
  const currentValue = useStore((state) => state.currentValue);
  const steps = useStore((state) => state.steps);

  const [listRef, setListRef] = React.useState<HTMLOListElement | null>(null);
  const composedRef = useComposedRefs(ref, setListRef);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (!listRef) return;

      const stepValues = Array.from(steps.keys());
      const currentIndex = stepValues.indexOf(currentValue || "");

      let targetIndex = -1;
      let preventDefault = false;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowUp": {
          preventDefault = true;
          if (orientation === "horizontal") {
            targetIndex =
              event.key === "ArrowLeft"
                ? Math.max(0, currentIndex - 1)
                : currentIndex;
          } else {
            targetIndex =
              event.key === "ArrowUp"
                ? Math.max(0, currentIndex - 1)
                : currentIndex;
          }
          break;
        }
        case "ArrowRight":
        case "ArrowDown": {
          preventDefault = true;
          if (orientation === "horizontal") {
            targetIndex =
              event.key === "ArrowRight"
                ? Math.min(stepValues.length - 1, currentIndex + 1)
                : currentIndex;
          } else {
            targetIndex =
              event.key === "ArrowDown"
                ? Math.min(stepValues.length - 1, currentIndex + 1)
                : currentIndex;
          }
          break;
        }
        case "Home": {
          preventDefault = true;
          targetIndex = 0;
          break;
        }
        case "End": {
          preventDefault = true;
          targetIndex = stepValues.length - 1;
          break;
        }
      }

      if (preventDefault) {
        event.preventDefault();
      }

      if (
        targetIndex >= 0 &&
        targetIndex !== currentIndex &&
        targetIndex < stepValues.length
      ) {
        const targetValue = stepValues[targetIndex];
        if (!targetValue) return;
        const targetStep = steps.get(targetValue);

        // Only navigate if the step is not disabled
        if (targetStep && !targetStep.disabled && !context.disabled) {
          store.setState("currentValue", targetValue);

          // Focus the target trigger
          const targetTrigger = listRef.querySelector(
            `[data-value="${targetValue}"] [role="tab"]`,
          ) as HTMLElement;
          if (targetTrigger) {
            targetTrigger.focus();
          }
        }
      }
    },
    [listRef, steps, currentValue, orientation, store, context.disabled],
  );

  const ListPrimitive = asChild ? Slot : "ol";

  return (
    <ListPrimitive
      ref={composedRef}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="stepper-list"
      dir={context.dir}
      className={cn(stepperListVariants({ orientation, className }))}
      onKeyDown={onKeyDown}
      {...listProps}
    >
      {children}
    </ListPrimitive>
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
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
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
    value,
    completed = false,
    disabled = false,
    className,
    children,
    ref,
    asChild,
    ...itemProps
  } = props;
  const context = useStepperContext(ITEM_NAME);
  const store = useStoreContext(ITEM_NAME);
  const orientation = useStore((state) => state.orientation);
  const currentValue = useStore((state) => state.currentValue);

  const triggerId = React.useId();
  const contentId = React.useId();
  const titleId = React.useId();
  const descriptionId = React.useId();

  const onValueAdd = React.useCallback(() => {
    context.onValueAdd?.(value);
  }, [context.onValueAdd, value]);

  const onValueRemove = React.useCallback(() => {
    context.onValueRemove?.(value);
  }, [context.onValueRemove, value]);

  useIsomorphicLayoutEffect(() => {
    store.addStep(value, completed, disabled);
    onValueAdd();

    return () => {
      store.removeStep(value);
      onValueRemove();
    };
  }, [store, value, completed, disabled, onValueAdd, onValueRemove]);

  useIsomorphicLayoutEffect(() => {
    store.setStep(value, { completed, disabled });
  }, [store, value, completed, disabled]);

  const stepState = useStore((state) => state.steps.get(value));
  const state = getDataState(currentValue, stepState);

  const itemContextValue = React.useMemo<StepperItemContextValue>(
    () => ({
      value,
      stepState,
      triggerId,
      contentId,
      titleId,
      descriptionId,
    }),
    [value, stepState, triggerId, contentId, titleId, descriptionId],
  );

  const ItemPrimitive = asChild ? Slot : "li";

  return (
    <StepperItemContext.Provider value={itemContextValue}>
      <ItemPrimitive
        ref={ref}
        role="presentation"
        data-value={value}
        data-state={state}
        data-disabled={stepState?.disabled ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper-item"
        dir={context.dir}
        className={cn(stepperItemVariants({ orientation, className }))}
        {...itemProps}
      >
        {children}
      </ItemPrimitive>
    </StepperItemContext.Provider>
  );
}

interface StepperTriggerProps extends React.ComponentProps<typeof Button> {
  asChild?: boolean;
}

function StepperTrigger(props: StepperTriggerProps) {
  const {
    variant = "ghost",
    size = "icon",
    className,
    children,
    asChild = false,
    ref,
    ...triggerProps
  } = props;

  const context = useStepperContext(TRIGGER_NAME);
  const itemContext = useStepperItemContext(TRIGGER_NAME);
  const store = useStoreContext(TRIGGER_NAME);
  const currentValue = useStore((state) => state.currentValue);
  const stepValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(stepValue));
  const globalDisabled = useStore((state) => state.disabled);

  const isDisabled =
    globalDisabled || stepState?.disabled || triggerProps.disabled;
  const isActive = currentValue === stepValue;
  const state = getDataState(currentValue, stepState);

  const onStepClick = React.useCallback(() => {
    if (!isDisabled && !context.nonInteractive) {
      store.setState("currentValue", stepValue);
    }
  }, [isDisabled, context.nonInteractive, store, stepValue]);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      // Handle Enter and Space key activation
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (!isDisabled && !context.nonInteractive) {
          store.setState("currentValue", stepValue);
        }
      }
    },
    [isDisabled, context.nonInteractive, store, stepValue],
  );

  const TriggerPrimitive = asChild ? Slot : Button;

  return (
    <TriggerPrimitive
      ref={ref}
      id={itemContext.triggerId}
      role="tab"
      aria-selected={isActive}
      aria-controls={itemContext.contentId}
      aria-describedby={`${itemContext.titleId} ${itemContext.descriptionId}`}
      tabIndex={isActive ? 0 : -1}
      variant={variant}
      size={size}
      data-state={state}
      data-disabled={isDisabled ? "" : undefined}
      data-slot="stepper-trigger"
      className={cn("rounded-full", className)}
      disabled={isDisabled}
      onClick={onStepClick}
      onKeyDown={onKeyDown}
      {...triggerProps}
    >
      {children}
    </TriggerPrimitive>
  );
}

const stepperIndicatorVariants = cva(
  "flex items-center justify-center rounded-full border-2 font-medium transition-colors",
  {
    variants: {
      state: {
        inactive: "border-muted bg-background text-muted-foreground",
        active: "border-primary bg-primary text-primary-foreground",
        completed: "border-primary bg-primary text-primary-foreground",
      },
      size: {
        sm: "size-6 text-xs",
        default: "size-8 text-sm",
        lg: "size-10 text-base",
      },
    },
    defaultVariants: {
      state: "inactive",
      size: "default",
    },
  },
);

interface StepperIndicatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function StepperIndicator(props: StepperIndicatorProps) {
  const { className, children, ref, asChild, ...indicatorProps } = props;
  const context = useStepperContext(INDICATOR_NAME);
  const itemContext = useStepperItemContext(INDICATOR_NAME);
  const currentValue = useStore((state) => state.currentValue);
  const stepValue = itemContext.value;
  const stepState = useStore((state) => state.steps.get(stepValue));

  const state = getDataState(currentValue, stepState);

  const IndicatorPrimitive = asChild ? Slot : "div";

  return (
    <IndicatorPrimitive
      ref={ref}
      data-state={state}
      data-slot="stepper-indicator"
      dir={context.dir}
      className={cn(stepperIndicatorVariants({ state, className }))}
      {...indicatorProps}
    >
      {stepState?.completed ? <Check className="size-4" /> : children}
    </IndicatorPrimitive>
  );
}

const stepperSeparatorVariants = cva("bg-border transition-colors", {
  variants: {
    orientation: {
      horizontal: "mx-2 h-px flex-1",
      vertical: "mr-1 ml-3 h-8 w-px",
    },
    state: {
      inactive: "bg-border",
      active: "bg-primary",
      completed: "bg-primary",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    state: "inactive",
  },
});

interface StepperSeparatorProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function StepperSeparator(props: StepperSeparatorProps) {
  const { className, asChild, ref, ...separatorProps } = props;
  const context = useStepperContext(SEPARATOR_NAME);
  const itemContext = useStepperItemContext(SEPARATOR_NAME);
  const currentValue = useStore((state) => state.currentValue);
  const orientation = useStore((state) => state.orientation);

  const state = getDataState(currentValue, itemContext.stepState);

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      ref={ref}
      data-state={state}
      data-orientation={orientation}
      data-slot="stepper-separator"
      dir={context.dir}
      className={cn(
        stepperSeparatorVariants({ orientation, state, className }),
      )}
      {...separatorProps}
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

  const TitlePrimitive = asChild ? Slot : "span";

  return (
    <TitlePrimitive
      ref={ref}
      id={itemContext.titleId}
      data-slot="stepper-item-title"
      dir={context.dir}
      className={cn("font-medium text-sm", className)}
      {...titleProps}
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

  const DescriptionPrimitive = asChild ? Slot : "span";

  return (
    <DescriptionPrimitive
      ref={ref}
      id={itemContext.descriptionId}
      data-slot="stepper-item-description"
      dir={context.dir}
      className={cn("text-muted-foreground text-xs", className)}
      {...descriptionProps}
    />
  );
}

interface StepperContentProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function StepperContent(props: StepperContentProps) {
  const { value: stepValue, className, asChild, ref, ...contentProps } = props;
  const context = useStepperContext(CONTENT_NAME);
  const currentValue = useStore((state) => state.currentValue);

  const contentId = React.useId();

  if (stepValue !== currentValue) return null;

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      ref={ref}
      id={contentId}
      role="tabpanel"
      aria-label={`Content for step ${stepValue}`}
      data-value={stepValue}
      data-slot="stepper-content"
      dir={context.dir}
      className={cn("mt-4", className)}
      {...contentProps}
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
