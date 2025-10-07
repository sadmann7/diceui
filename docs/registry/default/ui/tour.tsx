"use client";

import {
  autoUpdate,
  flip,
  hide,
  limitShift,
  type Middleware,
  offset,
  type Placement,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
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
  maskPath: string;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => State;
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
    () => selector(store.getState()),
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

function getSideAndAlignFromPlacement(placement: Placement): [Side, Align] {
  const [side, align = "center"] = placement.split("-") as [Side, Align?];
  return [side, align];
}

function getPlacement(side: Side, align: Align): Placement {
  if (align === "center") {
    return side as Placement;
  }
  return `${side}-${align}` as Placement;
}

function updateMask(
  store: Store,
  targetElement: HTMLElement,
  padding: number = 4,
) {
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
    maskPath: "",
  }));

  const listeners = useLazyRef<Set<() => void>>(() => new Set());

  const store: Store = React.useMemo(() => {
    return {
      subscribe: (cb) => {
        listeners.current.add(cb);
        return () => listeners.current.delete(cb);
      },
      getState: () => {
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

              // Position and mask updates are handled by the TourStep component
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

          if (nextStep && scrollToElementProp) {
            const targetElement = getTargetElement(nextStep.target);
            if (targetElement) {
              scrollToElement(targetElement, scrollBehavior, scrollOffset);
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

const EMPTY_BOUNDARY: Boundary[] = [];

function TourStep(props: TourStepProps) {
  const {
    target,
    side = "bottom",
    sideOffset = 8,
    align = "center",
    alignOffset = 0,
    collisionBoundary,
    collisionPadding = 0,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    avoidCollisions = true,
    required = false,
    forceMount = false,
    onStepEnter,
    onStepLeave,
    className,
    children,
    asChild,
    ...stepProps
  } = props;

  const boundaryRef = React.useRef(collisionBoundary ?? EMPTY_BOUNDARY);

  React.useEffect(() => {
    boundaryRef.current = collisionBoundary ?? EMPTY_BOUNDARY;
  }, [collisionBoundary]);

  const store = useStoreContext(STEP_NAME);
  const stepIndexRef = React.useRef<number>(-1);

  const open = useStore((state) => state.open);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);
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
      collisionBoundary: boundaryRef.current,
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

  // Build middleware array
  const middleware = React.useMemo(() => {
    if (!stepData) return [];

    const mainAxisOffset = stepData.sideOffset ?? sideOffset;
    const crossAxisOffset = stepData.alignOffset ?? alignOffset;

    const padding =
      typeof stepData.collisionPadding === "number"
        ? stepData.collisionPadding
        : {
            top: stepData.collisionPadding?.top ?? 0,
            right: stepData.collisionPadding?.right ?? 0,
            bottom: stepData.collisionPadding?.bottom ?? 0,
            left: stepData.collisionPadding?.left ?? 0,
          };

    const boundary = Array.isArray(stepData.collisionBoundary)
      ? stepData.collisionBoundary
      : stepData.collisionBoundary
        ? [stepData.collisionBoundary]
        : [];
    const hasExplicitBoundaries = boundary.length > 0;

    const detectOverflowOptions = {
      padding,
      boundary: boundary.filter((b): b is Element => b !== null),
      // with `strategy: 'fixed'`, this is the only way to get it to respect boundaries
      altBoundary: hasExplicitBoundaries,
    };

    return [
      offset({
        mainAxis: mainAxisOffset,
        alignmentAxis: crossAxisOffset,
      }),
      stepData.avoidCollisions &&
        shift({
          mainAxis: true,
          crossAxis: false,
          limiter: stepData.sticky === "partial" ? limitShift() : undefined,
          ...detectOverflowOptions,
        }),
      stepData.avoidCollisions && flip({ ...detectOverflowOptions }),
      stepData.hideWhenDetached &&
        hide({
          strategy: "referenceHidden",
          ...detectOverflowOptions,
        }),
    ].filter(Boolean) as Middleware[];
  }, [stepData, sideOffset, alignOffset]);

  // Use Floating UI for positioning
  const placement = getPlacement(
    stepData?.side ?? side,
    stepData?.align ?? align,
  );

  const {
    refs,
    floatingStyles,
    placement: finalPlacement,
    middlewareData,
  } = useFloating({
    placement,
    middleware,
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
    elements: {
      reference: targetElement,
    },
  });

  const [placedSide, placedAlign] =
    getSideAndAlignFromPlacement(finalPlacement);

  // Update mask when position changes
  React.useEffect(() => {
    if (open && targetElement && isCurrentStep) {
      updateMask(store, targetElement, 4);
    }
  }, [open, targetElement, isCurrentStep, store]);

  if (!open || !stepData || (!targetElement && !forceMount) || !isCurrentStep) {
    return null;
  }

  const isHidden = hideWhenDetached && middlewareData.hide?.referenceHidden;

  const StepPrimitive = asChild ? Slot : "div";

  return (
    <StepPrimitive
      ref={refs.setFloating}
      data-slot="tour-step"
      data-side={placedSide}
      data-align={placedAlign}
      {...stepProps}
      className={cn(
        "fixed z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md",
        className,
      )}
      style={{
        ...floatingStyles,
        visibility: isHidden ? "hidden" : undefined,
        pointerEvents: isHidden ? "none" : undefined,
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
  type TourRootProps as TourProps,
};
