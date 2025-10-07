"use client";

import { Slot } from "@radix-ui/react-slot";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Tour";
const STEP_NAME = "TourStep";
const CLOSE_NAME = "TourClose";
const PREV_NAME = "TourPrev";
const NEXT_NAME = "TourNext";
const SKIP_NAME = "TourSkip";
const OVERLAY_NAME = "TourOverlay";

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];
type Direction = "ltr" | "rtl";

interface ScrollOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

type Boundary = Element | null;

interface StepData {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  collisionBoundary?: Boundary | Boundary[];
  collisionPadding?: number | Partial<Record<Side, number>>;
  arrowPadding?: number;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  avoidCollisions?: boolean;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
  required?: boolean;
}

interface State {
  open: boolean;
  value: number;
  steps: StepData[];
  position: { top: number; left: number };
  maskPath: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  snapshot: () => State;
  setState: <K extends keyof State>(
    key: K,
    value: State[K],
    opts?: unknown,
  ) => void;
  notify: () => void;
  addStep: (stepData: StepData) => number;
  removeStep: (index: number) => void;
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

function useStore<T>(selector: (state: State) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.snapshot()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

function getTargetElement(
  target: string | React.RefObject<HTMLElement> | HTMLElement,
): HTMLElement | null {
  if (typeof target === "string") {
    return document.querySelector(target);
  }
  if (target && "current" in target) {
    return target.current;
  }
  if (target instanceof HTMLElement) {
    return target;
  }
  return null;
}

function getElementRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height,
    bottom: rect.bottom + window.scrollY,
    right: rect.right + window.scrollX,
  };
}

function scrollToElement(
  element: HTMLElement,
  scrollBehavior: ScrollBehavior = "smooth",
  scrollOffset?: ScrollOffset,
) {
  const offset = {
    top: 100,
    bottom: 100,
    left: 0,
    right: 0,
    ...scrollOffset,
  };
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;

  const isInViewport =
    rect.top >= offset.top &&
    rect.bottom <= viewportHeight - offset.bottom &&
    rect.left >= offset.left &&
    rect.right <= viewportWidth - offset.right;

  if (!isInViewport) {
    const elementTop = rect.top + window.scrollY;
    const scrollTop = elementTop - offset.top;

    window.scrollTo({
      top: Math.max(0, scrollTop),
      behavior: scrollBehavior,
    });
  }
}

function updatePositionAndMask(
  store: Store,
  stepData: StepData,
  padding: number = 4,
) {
  const targetElement = getTargetElement(stepData.target);
  if (!targetElement) return;

  const rect = getElementRect(targetElement);
  const side = stepData.side ?? "bottom";
  const align = stepData.align ?? "center";
  const sideOffset = stepData.sideOffset ?? 8;
  const alignOffset = stepData.alignOffset ?? 0;

  let top = 0;
  let left = 0;

  // Calculate position based on side
  switch (side) {
    case "top":
      top = rect.top - sideOffset;
      break;
    case "bottom":
      top = rect.bottom + sideOffset;
      break;
    case "left":
      left = rect.left - sideOffset;
      break;
    case "right":
      left = rect.right + sideOffset;
      break;
  }

  // Calculate alignment
  if (side === "top" || side === "bottom") {
    switch (align) {
      case "start":
        left = rect.left + alignOffset;
        break;
      case "center":
        left = rect.left + rect.width / 2 + alignOffset;
        break;
      case "end":
        left = rect.right + alignOffset;
        break;
    }
  } else {
    // left or right side
    switch (align) {
      case "start":
        top = rect.top + alignOffset;
        break;
      case "center":
        top = rect.top + rect.height / 2 + alignOffset;
        break;
      case "end":
        top = rect.bottom + alignOffset;
        break;
    }
  }

  store.setState("position", { top, left });

  const clientRect = targetElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const x = Math.max(0, clientRect.left - padding);
  const y = Math.max(0, clientRect.top - padding);
  const width = Math.min(viewportWidth - x, clientRect.width + padding * 2);
  const height = Math.min(viewportHeight - y, clientRect.height + padding * 2);

  const path = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x + width}px ${y}px, ${x + width}px ${y + height}px, ${x}px ${y + height}px, ${x}px 100%, 100% 100%, 100% 0%)`;
  store.setState("maskPath", path);
}

function getTransform(side: Side = "bottom", align: Align = "center") {
  let transformX = "0";
  let transformY = "0";

  // Calculate transform based on side
  switch (side) {
    case "top":
      transformY = "-100%";
      break;
    case "bottom":
      transformY = "0";
      break;
    case "left":
      transformX = "-100%";
      break;
    case "right":
      transformX = "0";
      break;
  }

  // Calculate alignment transform
  if (side === "top" || side === "bottom") {
    switch (align) {
      case "start":
        transformX = "0";
        break;
      case "center":
        transformX = "-50%";
        break;
      case "end":
        transformX = "-100%";
        break;
    }
  } else {
    // left or right side
    switch (align) {
      case "start":
        transformY = "0";
        break;
      case "center":
        transformY = "-50%";
        break;
      case "end":
        transformY = "-100%";
        break;
    }
  }

  return `translate(${transformX}, ${transformY})`;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const TourContext = React.createContext<React.ReactElement | undefined>(
  undefined,
);

function useTourContext(consumerName: string) {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TourRootProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  dir?: Direction;
  padding?: number;
  borderRadius?: number;
  scrollToElement?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollOffset?: ScrollOffset;
  stepFooter?: React.ReactElement;
}

function TourRoot(props: TourRootProps) {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    onComplete,
    onSkip,
    onEscapeKeyDown,
    stepFooter,
    padding = 4,
    scrollToElement: scrollToElementProp = false,
    scrollBehavior = "smooth",
    scrollOffset,
    asChild,
    ...rootProps
  } = props;

  const state = useLazyRef<State>(() => ({
    open: openProp ?? defaultOpen,
    value: valueProp ?? defaultValue,
    steps: [],
    position: { top: 0, left: 0 },
    maskPath: "",
  }));

  const listeners = useLazyRef<Set<() => void>>(() => new Set());

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listeners.current.add(cb);
        return () => listeners.current.delete(cb);
      },
      snapshot: () => {
        return state.current;
      },
      setState: (key, value, _opts) => {
        if (Object.is(state.current[key], value)) return;
        state.current[key] = value;

        if (key === "open") {
          onOpenChange?.(value as boolean);

          if (value) {
            if (state.current.steps.length > 0) {
              if (state.current.value >= state.current.steps.length) {
                store.setState("value", 0);
              }

              const currentStepIndex =
                state.current.value >= state.current.steps.length
                  ? 0
                  : state.current.value;
              const currentStepData = state.current.steps[currentStepIndex];
              if (currentStepData) {
                queueMicrotask(() => {
                  updatePositionAndMask(store, currentStepData, padding);
                });
              }
            }
          } else {
            if (state.current.value < (state.current.steps.length || 0) - 1) {
              onSkip?.();
            }
          }
        } else if (key === "value") {
          const prevStep = state.current.steps[state.current.value];
          const nextStep = state.current.steps[value as number];

          prevStep?.onStepLeave?.();
          nextStep?.onStepEnter?.();

          if (valueProp !== undefined) {
            onValueChange?.(value as number);
            return;
          }

          onValueChange?.(value as number);

          if ((value as number) >= state.current.steps.length) {
            onComplete?.();
            store.setState("open", false);
            return;
          }

          if (nextStep) {
            updatePositionAndMask(store, nextStep, padding);

            if (scrollToElementProp) {
              const targetElement = getTargetElement(nextStep.target);
              if (targetElement) {
                scrollToElement(targetElement, scrollBehavior, scrollOffset);
              }
            }
          }
        }

        store.notify();
      },
      notify: () => {
        listeners.current.forEach((l) => {
          l();
        });
      },
      addStep: (stepData) => {
        const newSteps = [...state.current.steps, stepData];
        state.current.steps = newSteps;
        store.notify();
        return newSteps.length - 1;
      },
      removeStep: (index) => {
        state.current.steps = state.current.steps.filter((_, i) => i !== index);
        store.notify();
      },
    };
  }, [
    onOpenChange,
    onValueChange,
    onComplete,
    onSkip,
    padding,
    scrollToElementProp,
    scrollBehavior,
    scrollOffset,
    valueProp,
    state,
    listeners,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp, store]);

  useIsomorphicLayoutEffect(() => {
    if (valueProp !== undefined) {
      store.setState("value", valueProp);
    }
  }, [valueProp, store]);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (state.current.open && event.key === "Escape") {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(event);
          if (event.defaultPrevented) return;
        }
        store.setState("open", false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store, onEscapeKeyDown, state]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <TourContext.Provider value={stepFooter}>
        <RootPrimitive data-slot="tour" {...rootProps} />
      </TourContext.Provider>
    </StoreContext.Provider>
  );
}

interface TourStepProps extends DivProps {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
  collisionBoundary?: Boundary | Boundary[];
  collisionPadding?: number | Partial<Record<Side, number>>;
  arrowPadding?: number;
  sticky?: "partial" | "always";
  hideWhenDetached?: boolean;
  avoidCollisions?: boolean;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
  required?: boolean;
  forceMount?: boolean;
}

function TourStep(props: TourStepProps) {
  const {
    target,
    side = "bottom",
    sideOffset = 8,
    align = "center",
    alignOffset = 0,
    collisionBoundary = [],
    collisionPadding = 0,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    avoidCollisions = false,
    required = false,
    forceMount = false,
    onStepEnter,
    onStepLeave,
    className,
    children,
    asChild,
    ...stepProps
  } = props;

  const store = useStoreContext(STEP_NAME);
  const stepIndexRef = React.useRef<number>(-1);

  const open = useStore((state) => state.open);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);
  const position = useStore((state) => state.position);
  const stepFooter = useTourContext(STEP_NAME);

  const hasStepFooter = React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    return child.type === TourFooter;
  });

  useIsomorphicLayoutEffect(() => {
    const stepData: StepData = {
      target,
      side,
      sideOffset,
      align,
      alignOffset,
      collisionBoundary,
      collisionPadding,
      arrowPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions,
      onStepEnter,
      onStepLeave,
      required,
    };

    const index = store.addStep(stepData);
    stepIndexRef.current = index;

    const state = store.snapshot();
    if (index === 0 && state.open) {
      queueMicrotask(() => {
        updatePositionAndMask(store, stepData, 4);
      });
    }

    return () => {
      store.removeStep(stepIndexRef.current);
    };
  }, [
    store,
    target,
    side,
    sideOffset,
    align,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    avoidCollisions,
    required,
    onStepEnter,
    onStepLeave,
  ]);

  const stepData = steps[value];
  const targetElement = stepData ? getTargetElement(stepData.target) : null;

  const isCurrentStep = stepIndexRef.current === value;

  React.useEffect(() => {
    if (!open || !stepData || !targetElement || !isCurrentStep) return;

    function updatePosition() {
      if (stepData) {
        updatePositionAndMask(store, stepData, 4);
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, stepData, targetElement, store, isCurrentStep]);

  if (!open || !stepData || (!targetElement && !forceMount) || !isCurrentStep) {
    return null;
  }

  const StepPrimitive = asChild ? Slot : "div";

  return (
    <StepPrimitive
      data-slot="tour-step"
      data-side={stepData.side}
      data-align={stepData.align}
      {...stepProps}
      className={cn(
        "fixed z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md",
        className,
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: getTransform(
          stepData.side ?? "bottom",
          stepData.align ?? "center",
        ),
      }}
    >
      {children}
      {!hasStepFooter && stepFooter && stepFooter}
    </StepPrimitive>
  );
}

interface TourOverlayProps extends DivProps {
  forceMount?: boolean;
}

function TourOverlay(props: TourOverlayProps) {
  const {
    asChild,
    className,
    style,
    forceMount = false,
    ...backdropProps
  } = props;

  const store = useStoreContext(OVERLAY_NAME);
  const open = useStore((state) => state.open);
  const maskPath = useStore((state) => state.maskPath);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      backdropProps.onClick?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [store, backdropProps.onClick],
  );

  if (!open && !forceMount) return null;

  const OverlayPrimitive = asChild ? Slot : "div";

  return (
    <OverlayPrimitive
      data-state={open ? "open" : "closed"}
      data-slot="tour-overlay"
      {...backdropProps}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      style={{
        ...style,
        clipPath: maskPath,
      }}
      onClick={onClick}
    />
  );
}

function TourHeader(props: DivProps) {
  const { asChild, className, ...headerProps } = props;

  const HeaderPrimitive = asChild ? Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="tour-header"
      {...headerProps}
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className,
      )}
    />
  );
}

interface TourTitleProps extends React.ComponentProps<"h2"> {
  asChild?: boolean;
}

function TourTitle(props: TourTitleProps) {
  const { asChild, className, ...titleProps } = props;

  const TitlePrimitive = asChild ? Slot : "h2";

  return (
    <TitlePrimitive
      data-slot="tour-title"
      {...titleProps}
      className={cn(
        "font-semibold text-lg leading-none tracking-tight",
        className,
      )}
    />
  );
}

interface TourDescriptionProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}

function TourDescription(props: TourDescriptionProps) {
  const { asChild, className, ...descriptionProps } = props;

  const DescriptionPrimitive = asChild ? Slot : "p";

  return (
    <DescriptionPrimitive
      data-slot="tour-description"
      {...descriptionProps}
      className={cn("text-muted-foreground text-sm", className)}
    />
  );
}

function TourFooter(props: DivProps) {
  const { asChild, className, ...footerProps } = props;

  const FooterPrimitive = asChild ? Slot : "div";

  return (
    <FooterPrimitive
      data-slot="tour-footer"
      {...footerProps}
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    />
  );
}

function TourClose(props: ButtonProps) {
  const { asChild, className, ...closeButtonProps } = props;

  const store = useStoreContext(CLOSE_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      closeButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [store, closeButtonProps.onClick],
  );

  const ClosePrimitive = asChild ? Slot : "button";

  return (
    <ClosePrimitive
      type="button"
      aria-label="Close tour"
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className,
      )}
      onClick={onClick}
      {...closeButtonProps}
    >
      <X className="size-4" />
    </ClosePrimitive>
  );
}

interface TourStepCounterProps extends DivProps {
  format?: (current: number, total: number) => string;
}

function TourStepCounter(props: TourStepCounterProps) {
  const {
    format = (current, total) => `${current} / ${total}`,
    asChild,
    className,
    children,
    ...stepCounterProps
  } = props;

  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const StepCounterPrimitive = asChild ? Slot : "div";

  return (
    <StepCounterPrimitive
      data-slot="tour-step-counter"
      {...stepCounterProps}
      className={cn("text-muted-foreground text-sm", className)}
    >
      {children ?? format(value + 1, steps.length)}
    </StepCounterPrimitive>
  );
}

function TourPrev(props: ButtonProps) {
  const { asChild, className, children, ...prevButtonProps } = props;

  const store = useStoreContext(PREV_NAME);
  const value = useStore((state) => state.value);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      prevButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      if (value > 0) {
        store.setState("value", value - 1);
      }
    },
    [value, store, prevButtonProps.onClick],
  );

  const isDisabled = value === 0;

  const PrevPrimitive = asChild ? Slot : "button";

  return (
    <PrevPrimitive
      type="button"
      aria-label="Previous step"
      data-slot="tour-prev"
      {...prevButtonProps}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={onClick}
      disabled={isDisabled}
    >
      {children ?? (
        <>
          <ChevronLeft className="size-4" />
          Previous
        </>
      )}
    </PrevPrimitive>
  );
}

function TourNext(props: ButtonProps) {
  const { asChild, className, children, ...nextButtonProps } = props;
  const store = useStoreContext(NEXT_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      nextButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      store.setState("value", value + 1);
    },
    [value, store, nextButtonProps.onClick],
  );

  const isLastStep = value === steps.length - 1;

  const NextPrimitive = asChild ? Slot : "button";

  return (
    <NextPrimitive
      type="button"
      aria-label="Next step"
      data-slot="tour-next"
      {...nextButtonProps}
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={onClick}
    >
      {children ?? (
        <>
          {isLastStep ? "Finish" : "Next"}
          {!isLastStep && <ChevronRight className="size-4" />}
        </>
      )}
    </NextPrimitive>
  );
}

function TourSkip(props: ButtonProps) {
  const { asChild, className, children, ...skipButtonProps } = props;

  const store = useStoreContext(SKIP_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      skipButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [store, skipButtonProps.onClick],
  );

  const SkipPrimitive = asChild ? Slot : "button";

  return (
    <SkipPrimitive
      type="button"
      aria-label="Skip tour"
      data-slot="tour-skip"
      className={cn(
        "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={onClick}
      {...skipButtonProps}
    >
      {children ?? "Skip"}
    </SkipPrimitive>
  );
}

export {
  TourRoot as Root,
  TourStep as Step,
  TourOverlay as Overlay,
  TourHeader as Header,
  TourTitle as Title,
  TourDescription as Description,
  TourFooter as Footer,
  TourClose as Close,
  TourStepCounter as StepCounter,
  TourPrev as Prev,
  TourNext as Next,
  TourSkip as Skip,
  //
  TourRoot as Tour,
  TourStep,
  TourOverlay,
  TourHeader,
  TourTitle,
  TourDescription,
  TourFooter,
  TourClose,
  TourStepCounter,
  TourPrev,
  TourNext,
  TourSkip,
  //
  SIDE_OPTIONS,
  ALIGN_OPTIONS,
  //
  type TourRootProps as TourProps,
  type Side,
  type Align,
};
