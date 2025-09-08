"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { VisuallyHiddenInput } from "@/registry/default/components/visually-hidden-input";

const ROOT_NAME = "Stepper";
const LIST_NAME = "StepperList";
const ITEM_NAME = "StepperItem";
const ITEM_TRIGGER_NAME = "StepperItemTrigger";
const ITEM_INDICATOR_NAME = "StepperItemIndicator";
const ITEM_SEPARATOR_NAME = "StepperItemSeparator";
const ITEM_TITLE_NAME = "StepperItemTitle";
const ITEM_DESCRIPTION_NAME = "StepperItemDescription";
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
  clickable: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  snapshot: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

function createStore(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<StoreState>,
  onValueChange?: (value: string) => void,
  onValueComplete?: (value: string, completed: boolean) => void,
): Store & {
  addStep: (value: string, completed?: boolean, disabled?: boolean) => void;
  removeStep: (value: string) => void;
  setStepCompleted: (value: string, completed: boolean) => void;
  setStepDisabled: (value: string, disabled: boolean) => void;
} {
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
        clickable: true,
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
  };

  const addStep = (value: string, completed = false, disabled = false) => {
    const state = stateRef.current;
    if (state) {
      const newStep: StepState = { value, completed, disabled };
      state.steps.set(value, newStep);
      store.notify();
    }
  };

  const removeStep = (value: string) => {
    const state = stateRef.current;
    if (state) {
      state.steps.delete(value);
      store.notify();
    }
  };

  const setStepCompleted = (value: string, completed: boolean) => {
    const state = stateRef.current;
    if (state) {
      const step = state.steps.get(value);
      if (step) {
        state.steps.set(value, { ...step, completed });
        onValueComplete?.(value, completed);
        store.notify();
      }
    }
  };

  const setStepDisabled = (value: string, disabled: boolean) => {
    const state = stateRef.current;
    if (state) {
      const step = state.steps.get(value);
      if (step) {
        state.steps.set(value, { ...step, disabled });
        store.notify();
      }
    }
  };

  return { ...store, addStep, removeStep, setStepCompleted, setStepDisabled };
}

type ExtendedStore = Store & {
  addStep: (value: string, completed?: boolean, disabled?: boolean) => void;
  removeStep: (value: string) => void;
  setStepCompleted: (value: string, completed: boolean) => void;
  setStepDisabled: (value: string, disabled: boolean) => void;
};

const StoreContext = React.createContext<ExtendedStore | null>(null);

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
  disabled: boolean;
  clickable: boolean;
  dir: Direction;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
  listId: string;
  labelId: string;
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
  clickable?: boolean;
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
    clickable = true,
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
    clickable,
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
    clickable = true,
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

  const listId = React.useId();
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
      disabled,
      clickable,
      dir,
      onValueAdd,
      onValueRemove,
      listId,
      labelId,
    }),
    [disabled, clickable, dir, onValueAdd, onValueRemove, listId, labelId],
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
  const orientation = useStore((state) => state.orientation);

  const ListPrimitive = asChild ? Slot : "ol";

  return (
    <ListPrimitive
      ref={ref}
      id={context.listId}
      role="tablist"
      aria-orientation={orientation}
      data-orientation={orientation}
      data-slot="stepper-list"
      dir={context.dir}
      className={cn(stepperListVariants({ orientation }), className)}
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
    store.setStepCompleted(value, completed);
  }, [store, value, completed]);

  useIsomorphicLayoutEffect(() => {
    store.setStepDisabled(value, disabled);
  }, [store, value, disabled]);

  const stepState = useStore((state) => state.steps.get(value));
  const isActive = currentValue === value;

  const itemContextValue = React.useMemo(
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
        data-completed={stepState?.completed ? "" : undefined}
        data-disabled={stepState?.disabled ? "" : undefined}
        data-active={isActive ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper-item"
        dir={context.dir}
        className={cn(stepperItemVariants({ orientation }), className)}
        {...itemProps}
      >
        {children}
      </ItemPrimitive>
    </StepperItemContext.Provider>
  );
}

interface StepperItemTriggerProps extends React.ComponentProps<typeof Button> {
  value: string;
  asChild?: boolean;
}

function StepperItemTrigger(props: StepperItemTriggerProps) {
  const {
    value: stepValue,
    variant = "ghost",
    size = "icon",
    className,
    children,
    asChild = false,
    ref,
    ...triggerProps
  } = props;

  const context = useStepperContext(ITEM_TRIGGER_NAME);
  const itemContext = useStepperItemContext(ITEM_TRIGGER_NAME);
  const store = useStoreContext(ITEM_TRIGGER_NAME);
  const currentValue = useStore((state) => state.currentValue);
  const stepState = useStore((state) => state.steps.get(stepValue));
  const globalDisabled = useStore((state) => state.disabled);

  const isDisabled =
    globalDisabled || stepState?.disabled || triggerProps.disabled;
  const isActive = currentValue === stepValue;

  const onStepClick = React.useCallback(() => {
    if (!isDisabled && context.clickable) {
      store.setState("currentValue", stepValue);
    }
  }, [isDisabled, context.clickable, store, stepValue]);

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
      data-active={isActive ? "" : undefined}
      data-completed={stepState?.completed ? "" : undefined}
      data-disabled={isDisabled ? "" : undefined}
      data-slot="stepper-item-trigger"
      className={cn("rounded-full", className)}
      disabled={isDisabled}
      onClick={onStepClick}
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

interface StepperItemIndicatorProps extends React.ComponentProps<"div"> {
  value: string;
  asChild?: boolean;
}

function StepperItemIndicator(props: StepperItemIndicatorProps) {
  const {
    value: stepValue,
    className,
    children,
    ref,
    asChild,
    ...indicatorProps
  } = props;
  const context = useStepperContext(ITEM_INDICATOR_NAME);
  const currentValue = useStore((state) => state.currentValue);
  const stepState = useStore((state) => state.steps.get(stepValue));

  const isActive = stepValue === currentValue;
  const isCompleted = stepState?.completed ?? false;
  const state = isCompleted ? "completed" : isActive ? "active" : "inactive";

  const IndicatorPrimitive = asChild ? Slot : "div";

  return (
    <IndicatorPrimitive
      ref={ref}
      data-state={state}
      data-active={isActive ? "" : undefined}
      data-slot="stepper-item-indicator"
      dir={context.dir}
      className={cn(stepperIndicatorVariants({ state }), className)}
      {...indicatorProps}
    >
      {isCompleted ? <Check className="size-4" /> : children}
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

interface StepperItemSeparatorProps extends React.ComponentProps<"div"> {
  completed?: boolean;
  asChild?: boolean;
}

function StepperItemSeparator(props: StepperItemSeparatorProps) {
  const {
    className,
    completed = false,
    asChild,
    ref,
    ...separatorProps
  } = props;
  const context = useStepperContext(ITEM_SEPARATOR_NAME);
  const orientation = useStore((state) => state.orientation);

  const state = completed ? "completed" : "inactive";

  const SeparatorPrimitive = asChild ? Slot : "div";

  return (
    <SeparatorPrimitive
      ref={ref}
      data-state={state}
      data-orientation={orientation}
      data-slot="stepper-item-separator"
      dir={context.dir}
      className={cn(
        stepperSeparatorVariants({ orientation, state }),
        className,
      )}
      {...separatorProps}
    />
  );
}

interface StepperItemTitleProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperItemTitle(props: StepperItemTitleProps) {
  const { className, asChild, ref, ...titleProps } = props;
  const context = useStepperContext(ITEM_TITLE_NAME);
  const itemContext = useStepperItemContext(ITEM_TITLE_NAME);

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

interface StepperItemDescriptionProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function StepperItemDescription(props: StepperItemDescriptionProps) {
  const { className, asChild, ref, ...descriptionProps } = props;
  const context = useStepperContext(ITEM_DESCRIPTION_NAME);
  const itemContext = useStepperItemContext(ITEM_DESCRIPTION_NAME);

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
  const {
    value: stepValue,
    className,
    children,
    asChild,
    ref,
    ...contentProps
  } = props;
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
    >
      {children}
    </ContentPrimitive>
  );
}

function useStepperActions() {
  const store = useStoreContext("useStepperActions");

  const onValueComplete = React.useCallback(
    (value: string, completed: boolean = true) => {
      store.setStepCompleted(value, completed);
    },
    [store],
  );

  const onValueDisable = React.useCallback(
    (value: string, disabled: boolean = true) => {
      store.setStepDisabled(value, disabled);
    },
    [store],
  );

  const onValueNavigate = React.useCallback(
    (value: string) => {
      store.setState("currentValue", value);
    },
    [store],
  );

  return React.useMemo(
    () => ({
      onValueComplete,
      onValueDisable,
      onValueNavigate,
    }),
    [onValueComplete, onValueDisable, onValueNavigate],
  );
}

export {
  StepperRoot as Stepper,
  StepperList,
  StepperItem,
  StepperItemTrigger,
  StepperItemIndicator,
  StepperItemSeparator,
  StepperItemTitle,
  StepperItemDescription,
  StepperContent,
  //
  StepperRoot as Root,
  StepperList as List,
  StepperItem as Item,
  StepperItemTrigger as ItemTrigger,
  StepperItemIndicator as ItemIndicator,
  StepperItemSeparator as ItemSeparator,
  StepperItemTitle as ItemTitle,
  StepperItemDescription as ItemDescription,
  StepperContent as Content,
  //
  useStore as useStepper,
  useStepperActions,
  //
  type StepperRootProps as StepperProps,
};
