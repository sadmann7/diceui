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

type Direction = "ltr" | "rtl";

interface StepState {
  value: string;
  completed: boolean;
  disabled: boolean;
}

interface StoreState {
  steps: Map<string, StepState>;
  currentValue?: string;
  orientation: "horizontal" | "vertical";
  disabled: boolean;
  clickable: boolean;
}

type StoreAction =
  | { type: "ADD_STEP"; value: string; completed?: boolean; disabled?: boolean }
  | { type: "SET_CURRENT"; value: string }
  | { type: "SET_COMPLETED"; value: string; completed: boolean }
  | { type: "SET_DISABLED"; value: string; disabled: boolean }
  | { type: "SET_GLOBAL_DISABLED"; disabled: boolean }
  | { type: "REMOVE_STEP"; value: string };

function createStore(
  listeners: Set<() => void>,
  steps: Map<string, StepState>,
  orientation: "horizontal" | "vertical",
  disabled: boolean,
  clickable: boolean,
) {
  let state: StoreState = {
    steps,
    currentValue: undefined,
    orientation,
    disabled,
    clickable,
  };

  let onValueChange: ((value: string) => void) | undefined;
  let onValueComplete:
    | ((value: string, completed: boolean) => void)
    | undefined;

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.type) {
      case "ADD_STEP": {
        const newStep: StepState = {
          value: action.value,
          completed: action.completed ?? false,
          disabled: action.disabled ?? false,
        };
        steps.set(action.value, newStep);
        return { ...state, steps };
      }

      case "SET_CURRENT": {
        const newState = { ...state, currentValue: action.value };
        onValueChange?.(action.value);
        return newState;
      }

      case "SET_COMPLETED": {
        const step = steps.get(action.value);
        if (step) {
          const newCompleted = action.completed;
          steps.set(action.value, { ...step, completed: newCompleted });
          onValueComplete?.(action.value, newCompleted);
        }
        return { ...state, steps };
      }

      case "SET_DISABLED": {
        const step = steps.get(action.value);
        if (step) {
          steps.set(action.value, { ...step, disabled: action.disabled });
        }
        return { ...state, steps };
      }

      case "SET_GLOBAL_DISABLED": {
        return { ...state, disabled: action.disabled };
      }

      case "REMOVE_STEP": {
        steps.delete(action.value);
        return { ...state, steps };
      }

      default:
        return state;
    }
  }

  function getState() {
    return state;
  }

  function dispatch(action: StoreAction) {
    state = reducer(state, action);
    for (const listener of listeners) {
      listener();
    }
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function setCallbacks(
    valueChange?: (value: string) => void,
    valueComplete?: (value: string, completed: boolean) => void,
  ) {
    onValueChange = valueChange;
    onValueComplete = valueComplete;
  }

  return { getState, dispatch, subscribe, setCallbacks };
}

const StoreContext = React.createContext<ReturnType<typeof createStore> | null>(
  null,
);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
    () => null,
  );

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

interface StepperContextValue {
  disabled: boolean;
  clickable: boolean;
  dir: Direction;
  onValueAdd?: (value: string) => void;
  onValueRemove?: (value: string) => void;
  // Accessibility IDs
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
  orientation?: "horizontal" | "vertical";
  disabled?: boolean;
  clickable?: boolean;
  name?: string;
  asChild?: boolean;
}

function useDirection(dirProp?: Direction): Direction {
  return dirProp ?? "ltr";
}

function Stepper(props: StepperRootProps) {
  const listeners = useLazyRef(() => new Set<() => void>());
  const steps = useLazyRef<Map<string, StepState>>(() => new Map());

  const store = React.useMemo(
    () =>
      createStore(
        listeners.current,
        steps.current,
        props.orientation ?? "horizontal",
        props.disabled ?? false,
        props.clickable ?? true,
      ),
    [listeners, steps, props.orientation, props.disabled, props.clickable],
  );

  return (
    <StoreContext.Provider value={store}>
      <StepperImpl {...props} />
    </StoreContext.Provider>
  );
}

function StepperImpl(props: StepperRootProps) {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    onValueComplete,
    onValueAdd,
    onValueRemove,
    dir: dirProp,
    orientation = "horizontal",
    disabled = false,
    clickable = true,
    name,
    className,
    children,
    ref,
    ...rootProps
  } = props;

  const dir = useDirection(dirProp);
  const store = useStoreContext("StepperImpl");
  const isControlled = controlledValue !== undefined;

  // Generate accessibility IDs
  const listId = React.useId();
  const labelId = React.useId();

  const [formTrigger, setFormTrigger] = React.useState<HTMLDivElement | null>(
    null,
  );
  const composedRef = useComposedRefs(ref, setFormTrigger);
  const isFormControl = formTrigger ? !!formTrigger.closest("form") : true;

  // Memoize callbacks
  const onValueChangeCallback = React.useCallback(
    (value: string) => {
      onValueChange?.(value);
    },
    [onValueChange],
  );

  const onValueCompleteCallback = React.useCallback(
    (value: string, completed: boolean) => {
      onValueComplete?.(value, completed);
    },
    [onValueComplete],
  );

  // Update store with callbacks
  React.useEffect(() => {
    store.setCallbacks(onValueChangeCallback, onValueCompleteCallback);
  }, [store, onValueChangeCallback, onValueCompleteCallback]);

  // Initialize current value
  React.useEffect(() => {
    const currentValue = controlledValue ?? defaultValue;
    if (currentValue) {
      store.dispatch({ type: "SET_CURRENT", value: currentValue });
    }
  }, [controlledValue, defaultValue, store]);

  // Sync controlled value
  React.useEffect(() => {
    if (isControlled && controlledValue) {
      store.dispatch({ type: "SET_CURRENT", value: controlledValue });
    }
  }, [controlledValue, isControlled, store]);

  const currentValue = useStore((state) => state.currentValue);

  const contextValue = React.useMemo(
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
        aria-labelledby={labelId}
        data-disabled={disabled ? "" : undefined}
        data-orientation={orientation}
        data-slot="stepper"
        dir={dir}
        className={cn("flex flex-col gap-4", className)}
        {...rootProps}
      >
        <span id={labelId} className="sr-only">
          Stepper navigation
        </span>
        {children}
      </RootPrimitive>
      {isFormControl && name && (
        <VisuallyHiddenInput
          type="hidden"
          control={formTrigger}
          name={name}
          value={currentValue || ""}
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
  // Accessibility IDs for linking components
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

  React.useEffect(() => {
    store.dispatch({
      type: "ADD_STEP",
      value,
      completed,
      disabled,
    });
    onValueAdd();

    return () => {
      store.dispatch({ type: "REMOVE_STEP", value });
      onValueRemove();
    };
  }, [store, value, completed, disabled, onValueAdd, onValueRemove]);

  React.useEffect(() => {
    store.dispatch({ type: "SET_COMPLETED", value, completed });
  }, [store, value, completed]);

  React.useEffect(() => {
    store.dispatch({ type: "SET_DISABLED", value, disabled });
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
    size = "sm",
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
      store.dispatch({ type: "SET_CURRENT", value: stepValue });
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
      className={cn("p-0", className)}
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
        sm: "h-6 w-6 text-xs",
        default: "h-8 w-8 text-sm",
        lg: "h-10 w-10 text-base",
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
      {isCompleted ? <Check className="h-4 w-4" /> : children}
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

  // Generate a unique content ID for this content panel
  const contentId = React.useId();

  if (stepValue !== currentValue) {
    return null;
  }

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

// Helper hooks for programmatic control
function useStepperActions() {
  const store = useStoreContext("useStepperActions");

  const onValueComplete = React.useCallback(
    (value: string, completed: boolean = true) => {
      store.dispatch({ type: "SET_COMPLETED", value, completed });
    },
    [store],
  );

  const onValueDisable = React.useCallback(
    (value: string, disabled: boolean = true) => {
      store.dispatch({ type: "SET_DISABLED", value, disabled });
    },
    [store],
  );

  const onValueNavigate = React.useCallback(
    (value: string) => {
      store.dispatch({ type: "SET_CURRENT", value });
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
  Stepper,
  StepperList,
  StepperItem,
  StepperItemTrigger,
  StepperItemIndicator,
  StepperItemSeparator,
  StepperItemTitle,
  StepperItemDescription,
  StepperContent,
  //
  Stepper as Root,
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
