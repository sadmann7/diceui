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
const BACKDROP_NAME = "TourBackdrop";

type Direction = "ltr" | "rtl";
type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ButtonProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

interface StepData {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  placement?: Placement;
  offset?: number;
  skippable?: boolean;
  showOnTargetNotFound?: boolean;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
  element?: React.ReactElement;
}

interface StoreState {
  open: boolean;
  currentStep: number;
  steps: StepData[];
  dir: Direction;
  showBackdrop: boolean;
  closeOnBackdropClick: boolean;
  closeOnEscape: boolean;
  padding: number;
  borderRadius: number;
  scrollToElement: boolean;
  scrollBehavior: ScrollBehavior;
  scrollOffset: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  position: { top: number; left: number };
  maskPath: string;
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
  onValueChange?: Partial<{
    [K in keyof StoreState]: (value: StoreState[K], store: Store) => void;
  }>,
): Store {
  const store: Store = {
    subscribe: (cb) => {
      listenersRef.current?.add(cb);
      return () => listenersRef.current?.delete(cb);
    },
    getState: () => stateRef.current as StoreState,
    setState: (key, value) => {
      const currentState = stateRef.current as StoreState;
      if (Object.is(currentState[key], value)) return;
      currentState[key] = value;
      onValueChange?.[key]?.(value, store);
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

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
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
  behavior: ScrollBehavior = "smooth",
  offset = { top: 100, bottom: 100, left: 0, right: 0 },
) {
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
      behavior,
    });
  }
}

function updatePositionAndMask(store: Store, stepData?: StepData) {
  if (!stepData) return;

  const targetElement = getTargetElement(stepData.target);
  if (!targetElement) return;

  const state = store.getState();

  // Update position
  const rect = getElementRect(targetElement);
  const placement = stepData.placement || "bottom";
  const offset = stepData.offset || 8;

  let top = 0;
  let left = 0;

  switch (placement) {
    case "top":
      top = rect.top - offset;
      left = rect.left + rect.width / 2;
      break;
    case "top-start":
      top = rect.top - offset;
      left = rect.left;
      break;
    case "top-end":
      top = rect.top - offset;
      left = rect.right;
      break;
    case "bottom":
      top = rect.bottom + offset;
      left = rect.left + rect.width / 2;
      break;
    case "bottom-start":
      top = rect.bottom + offset;
      left = rect.left;
      break;
    case "bottom-end":
      top = rect.bottom + offset;
      left = rect.right;
      break;
    case "left":
      top = rect.top + rect.height / 2;
      left = rect.left - offset;
      break;
    case "left-start":
      top = rect.top;
      left = rect.left - offset;
      break;
    case "left-end":
      top = rect.bottom;
      left = rect.left - offset;
      break;
    case "right":
      top = rect.top + rect.height / 2;
      left = rect.right + offset;
      break;
    case "right-start":
      top = rect.top;
      left = rect.right + offset;
      break;
    case "right-end":
      top = rect.bottom;
      left = rect.right + offset;
      break;
  }

  store.setState("position", { top, left });

  // Update mask path
  if (state.showBackdrop) {
    const clientRect = targetElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = state.padding;

    const x = Math.max(0, clientRect.left - padding);
    const y = Math.max(0, clientRect.top - padding);
    const width = Math.min(viewportWidth - x, clientRect.width + padding * 2);
    const height = Math.min(
      viewportHeight - y,
      clientRect.height + padding * 2,
    );

    const path = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x + width}px ${y}px, ${x + width}px ${y + height}px, ${x}px ${y + height}px, ${x}px 100%, 100% 100%, 100% 0%)`;
    store.setState("maskPath", path);
  }
}

function getTransform(placement?: Placement) {
  switch (placement) {
    case "top":
    case "top-start":
    case "top-end":
      return "translate(-50%, -100%)";
    case "bottom":
    case "bottom-start":
    case "bottom-end":
      return "translate(-50%, 0)";
    case "left":
    case "left-start":
    case "left-end":
      return "translate(-100%, -50%)";
    case "right":
    case "right-start":
    case "right-end":
      return "translate(0, -50%)";
    default:
      return "translate(-50%, 0)";
  }
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useTourContext(consumerName: string) {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TourStepContextValue {
  stepIndex: number;
  stepData: StepData;
}

const TourStepContext = React.createContext<TourStepContextValue | null>(null);

const TourContext = React.createContext<React.ReactElement | undefined>(
  undefined,
);

interface TourRootProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  currentStep?: number;
  defaultCurrentStep?: number;
  onCurrentStepChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  dir?: Direction;
  showBackdrop?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  padding?: number;
  borderRadius?: number;
  scrollToElement?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollOffset?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
  };
  defaultFooter?: React.ReactElement;
}

function TourRoot(props: TourRootProps) {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    currentStep: currentStepProp,
    defaultCurrentStep = 0,
    onCurrentStepChange,
    onComplete,
    onSkip,
    dir = "ltr",
    showBackdrop = true,
    closeOnBackdropClick = false,
    closeOnEscape = true,
    padding = 4,
    borderRadius = 8,
    scrollToElement: scrollToElementProp = true,
    scrollBehavior = "smooth",
    scrollOffset = {},
    defaultFooter,
    asChild,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef(
    (): StoreState => ({
      open: openProp ?? defaultOpen,
      currentStep: currentStepProp ?? defaultCurrentStep,
      steps: [],
      dir,
      showBackdrop,
      closeOnBackdropClick,
      closeOnEscape,
      padding,
      borderRadius,
      scrollToElement: scrollToElementProp,
      scrollBehavior,
      scrollOffset: {
        top: 100,
        bottom: 100,
        left: 0,
        right: 0,
        ...scrollOffset,
      },
      position: { top: 0, left: 0 },
      maskPath: "",
    }),
  );

  const store = React.useMemo(
    () =>
      createStore(listenersRef, stateRef, {
        open: (value) => {
          onOpenChange?.(value);

          // If opening the tour, initialize position for current step
          if (value) {
            const state = stateRef.current;
            if (state && state.steps.length > 0) {
              // Reset currentStep to 0 if it's beyond the steps array (after completion)
              if (state.currentStep >= state.steps.length) {
                store.setState("currentStep", 0);
              }

              const currentStepIndex =
                state.currentStep >= state.steps.length ? 0 : state.currentStep;
              const currentStepData = state.steps[currentStepIndex];
              if (currentStepData) {
                // Use setTimeout to ensure DOM is ready
                setTimeout(() => {
                  updatePositionAndMask(store, currentStepData);
                }, 0);
              }
            }
          }

          // If closing the tour, check if it was skipped
          const state = stateRef.current;
          if (
            !value &&
            state &&
            state.currentStep < (state.steps.length || 0) - 1
          ) {
            onSkip?.();
          }
        },
        currentStep: (value, store) => {
          const state = store.getState();
          const prevStep = state.steps[state.currentStep];
          const nextStep = state.steps[value];

          prevStep?.onStepLeave?.();
          nextStep?.onStepEnter?.();

          onCurrentStepChange?.(value);

          // Handle completion
          if (value >= state.steps.length) {
            onComplete?.();
            store.setState("open", false);
            return;
          }

          // Update position and mask when step changes
          updatePositionAndMask(store, nextStep);

          // Scroll to target element
          if (state.scrollToElement && nextStep) {
            const targetElement = getTargetElement(nextStep.target);
            if (targetElement) {
              scrollToElement(
                targetElement,
                state.scrollBehavior,
                state.scrollOffset,
              );
            }
          }
        },
      }),
    [
      listenersRef,
      stateRef,
      onOpenChange,
      onCurrentStepChange,
      onComplete,
      onSkip,
    ],
  );

  // Update store state when props change
  React.useEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp, store]);

  React.useEffect(() => {
    if (currentStepProp !== undefined) {
      store.setState("currentStep", currentStepProp);
    }
  }, [currentStepProp, store]);

  React.useEffect(() => {
    store.setState("dir", dir);
  }, [dir, store]);

  React.useEffect(() => {
    store.setState("showBackdrop", showBackdrop);
  }, [showBackdrop, store]);

  React.useEffect(() => {
    store.setState("closeOnBackdropClick", closeOnBackdropClick);
  }, [closeOnBackdropClick, store]);

  React.useEffect(() => {
    store.setState("closeOnEscape", closeOnEscape);
  }, [closeOnEscape, store]);

  React.useEffect(() => {
    store.setState("padding", padding);
  }, [padding, store]);

  React.useEffect(() => {
    store.setState("borderRadius", borderRadius);
  }, [borderRadius, store]);

  React.useEffect(() => {
    store.setState("scrollToElement", scrollToElementProp);
  }, [scrollToElementProp, store]);

  React.useEffect(() => {
    store.setState("scrollBehavior", scrollBehavior);
  }, [scrollBehavior, store]);

  React.useEffect(() => {
    store.setState("scrollOffset", {
      top: 100,
      bottom: 100,
      left: 0,
      right: 0,
      ...scrollOffset,
    });
  }, [scrollOffset, store]);

  // Handle escape key
  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const state = store.getState();
      if (state.open && state.closeOnEscape && event.key === "Escape") {
        event.preventDefault();
        store.setState("open", false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <TourContext.Provider value={defaultFooter}>
        <RootPrimitive data-slot="tour" {...rootProps} />
      </TourContext.Provider>
    </StoreContext.Provider>
  );
}

interface TourStepProps extends DivProps {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  placement?: Placement;
  offset?: number;
  skippable?: boolean;
  showOnTargetNotFound?: boolean;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
}

function TourStep(props: TourStepProps) {
  const {
    target,
    placement = "bottom",
    offset = 8,
    skippable = true,
    showOnTargetNotFound = false,
    onStepEnter,
    onStepLeave,
    className,
    children,
    asChild,
    ...stepProps
  } = props;
  const store = useStoreContext(STEP_NAME);
  const stepIndex = React.useRef<number>(-1);

  const hasStepFooter = React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;

    return child.type === TourFooter;
  });

  // Register step with store
  useIsomorphicLayoutEffect(() => {
    const stepData: StepData = {
      target,
      placement,
      offset,
      skippable,
      showOnTargetNotFound,
      onStepEnter,
      onStepLeave,
    };

    const state = store.getState();
    const newSteps = [...state.steps, stepData];
    stepIndex.current = newSteps.length - 1;
    store.setState("steps", newSteps);

    // If this is the first step and tour is open, initialize position
    if (stepIndex.current === 0 && state.open) {
      setTimeout(() => {
        updatePositionAndMask(store, stepData);
      }, 0);
    }

    return () => {
      const currentState = store.getState();
      const filteredSteps = currentState.steps.filter(
        (_, index) => index !== stepIndex.current,
      );
      store.setState("steps", filteredSteps);
    };
  }, [
    target,
    placement,
    offset,
    skippable,
    showOnTargetNotFound,
    onStepEnter,
    onStepLeave,
    store,
  ]);

  const stepData: StepData = {
    target,
    placement,
    offset,
    skippable,
    showOnTargetNotFound,
    onStepEnter,
    onStepLeave,
  };

  // Content functionality (previously in TourContent)
  const open = useStore((state) => state.open);
  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);
  const position = useStore((state) => state.position);
  const defaultFooter = useTourContext(STEP_NAME);

  const currentStepData = steps[currentStep];
  const targetElement = currentStepData
    ? getTargetElement(currentStepData.target)
    : null;

  // Check if this content belongs to the current step
  const isCurrentStep = stepIndex.current === currentStep;

  React.useEffect(() => {
    if (!open || !currentStepData || !targetElement || !isCurrentStep) return;

    function updatePosition() {
      updatePositionAndMask(store, currentStepData);
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, currentStepData, targetElement, store, isCurrentStep]);

  // Additional effect to ensure position is set when tour becomes visible
  React.useEffect(() => {
    if (
      open &&
      currentStepData &&
      targetElement &&
      position.top === 0 &&
      position.left === 0 &&
      isCurrentStep
    ) {
      setTimeout(() => {
        updatePositionAndMask(store, currentStepData);
      }, 10);
    }
  }, [open, currentStepData, targetElement, position, store, isCurrentStep]);

  if (
    !open ||
    !currentStepData ||
    (!targetElement && !currentStepData.showOnTargetNotFound) ||
    !isCurrentStep
  ) {
    return null;
  }

  const StepPrimitive = asChild ? Slot : "div";

  return (
    <TourStepContext.Provider
      value={{ stepIndex: stepIndex.current, stepData }}
    >
      <StepPrimitive
        data-slot="tour-step"
        {...stepProps}
        className={cn(
          "fixed z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md",
          className,
        )}
        style={{
          top: position.top,
          left: position.left,
          transform: getTransform(currentStepData?.placement),
        }}
      >
        {children}
        {!hasStepFooter && defaultFooter && defaultFooter}
      </StepPrimitive>
    </TourStepContext.Provider>
  );
}

interface TourBackdropProps extends DivProps {}

function TourBackdrop(props: TourBackdropProps) {
  const { asChild, className, style, ...backdropProps } = props;

  const store = useStoreContext(BACKDROP_NAME);
  const open = useStore((state) => state.open);
  const showBackdrop = useStore((state) => state.showBackdrop);
  const closeOnBackdropClick = useStore((state) => state.closeOnBackdropClick);
  const maskPath = useStore((state) => state.maskPath);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      backdropProps.onClick?.(event);
      if (event.defaultPrevented || !closeOnBackdropClick) return;

      store.setState("open", false);
    },
    [closeOnBackdropClick, store, backdropProps.onClick],
  );

  if (!open || !showBackdrop) return null;

  const BackdropPrimitive = asChild ? Slot : "div";

  return (
    <BackdropPrimitive
      data-slot="tour-backdrop"
      {...backdropProps}
      className={cn("fixed inset-0 z-40 bg-black/50", className)}
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

  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);

  const StepCounterPrimitive = asChild ? Slot : "div";

  return (
    <StepCounterPrimitive
      data-slot="tour-step-counter"
      {...stepCounterProps}
      className={cn("text-muted-foreground text-sm", className)}
    >
      {children ?? format(currentStep + 1, steps.length)}
    </StepCounterPrimitive>
  );
}

function TourNavigation(props: DivProps) {
  const { asChild, className, ...navigationProps } = props;
  const NavigationPrimitive = asChild ? Slot : "div";

  return (
    <NavigationPrimitive
      data-slot="tour-navigation"
      {...navigationProps}
      className={cn("flex items-center justify-between", className)}
    />
  );
}

function TourPrev(props: ButtonProps) {
  const { asChild, className, children, ...prevButtonProps } = props;

  const store = useStoreContext(PREV_NAME);
  const currentStep = useStore((state) => state.currentStep);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      prevButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      if (currentStep > 0) {
        store.setState("currentStep", currentStep - 1);
      }
    },
    [currentStep, store, prevButtonProps.onClick],
  );

  const isDisabled = currentStep === 0;

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
  const currentStep = useStore((state) => state.currentStep);
  const steps = useStore((state) => state.steps);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      nextButtonProps.onClick?.(event);
      if (event.defaultPrevented) return;

      store.setState("currentStep", currentStep + 1);
    },
    [currentStep, store, nextButtonProps.onClick],
  );

  const isLastStep = currentStep === steps.length - 1;

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
  TourBackdrop as Backdrop,
  TourHeader as Header,
  TourTitle as Title,
  TourDescription as Description,
  TourFooter as Footer,
  TourClose as Close,
  TourStepCounter as StepCounter,
  TourNavigation as Navigation,
  TourPrev as Prev,
  TourNext as Next,
  TourSkip as Skip,
  //
  TourRoot as Tour,
  TourStep,
  TourBackdrop,
  TourHeader,
  TourTitle,
  TourDescription,
  TourFooter,
  TourClose,
  TourStepCounter,
  TourNavigation,
  TourPrev,
  TourNext,
  TourSkip,
  //
  type TourRootProps as TourProps,
};
