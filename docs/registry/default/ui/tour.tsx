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
  onStepEnter?: () => void;
  onStepLeave?: () => void;
  required?: boolean;
}

interface StoreState {
  open: boolean;
  value: number;
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
  addStep: (stepData: StepData) => number;
  removeStep: (index: number) => void;
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
      if (listenersRef.current) {
        listenersRef.current.add(cb);
        return () => listenersRef.current?.delete(cb);
      }
      return () => {};
    },
    getState: () =>
      stateRef.current ?? {
        open: false,
        value: 0,
        steps: [],
        dir: "ltr",
        showBackdrop: true,
        closeOnBackdropClick: false,
        closeOnEscape: true,
        padding: 4,
        borderRadius: 8,
        scrollToElement: true,
        scrollBehavior: "smooth",
        scrollOffset: { top: 100, bottom: 100, left: 0, right: 0 },
        position: { top: 0, left: 0 },
        maskPath: "",
      },
    setState: (key, value) => {
      const state = stateRef.current;
      if (!state || Object.is(state[key], value)) return;
      state[key] = value;
      onValueChange?.[key]?.(value, store);
      store.notify();
    },
    addStep: (stepData) => {
      const state = stateRef.current;
      if (state) {
        const newSteps = [...state.steps, stepData];
        state.steps = newSteps;
        store.notify();
        return newSteps.length - 1;
      }
      return -1;
    },
    removeStep: (index) => {
      const state = stateRef.current;
      if (state) {
        state.steps = state.steps.filter((_, i) => i !== index);
        store.notify();
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

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useStore<T>(selector: (state: StoreState) => T): T {
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

function updatePositionAndMask(store: Store, stepData: StepData) {
  const targetElement = getTargetElement(stepData.target);
  if (!targetElement) return;

  const state = store.getState();
  const rect = getElementRect(targetElement);
  const placement = stepData.placement ?? "bottom";
  const offset = stepData.offset ?? 8;

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

function getTransform(placement: Placement = "bottom") {
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
    dir = "ltr",
    showBackdrop = true,
    closeOnBackdropClick = false,
    closeOnEscape = true,
    padding = 4,
    borderRadius = 8,
    scrollToElement: scrollToElementProp = true,
    scrollBehavior = "smooth",
    scrollOffset = {},
    stepFooter,
    asChild,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen,
    value: valueProp ?? defaultValue,
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
  }));

  const store = React.useMemo(
    () =>
      createStore(listenersRef, stateRef, {
        open: (value) => {
          onOpenChange?.(value);

          if (value) {
            const state = stateRef.current;
            if (state && state.steps.length > 0) {
              if (state.value >= state.steps.length) {
                store.setState("value", 0);
              }

              const currentStepIndex =
                state.value >= state.steps.length ? 0 : state.value;
              const currentStepData = state.steps[currentStepIndex];
              if (currentStepData) {
                queueMicrotask(() => {
                  updatePositionAndMask(store, currentStepData);
                });
              }
            }
          } else {
            const state = stateRef.current;
            if (state && state.value < (state.steps.length || 0) - 1) {
              onSkip?.();
            }
          }
        },
        value: (value, store) => {
          const state = store.getState();
          const prevStep = state.steps[state.value];
          const nextStep = state.steps[value];

          prevStep?.onStepLeave?.();
          nextStep?.onStepEnter?.();

          onValueChange?.(value);

          if (value >= state.steps.length) {
            onComplete?.();
            store.setState("open", false);
            return;
          }

          if (nextStep) {
            updatePositionAndMask(store, nextStep);

            if (state.scrollToElement) {
              const targetElement = getTargetElement(nextStep.target);
              if (targetElement) {
                scrollToElement(
                  targetElement,
                  state.scrollBehavior,
                  state.scrollOffset,
                );
              }
            }
          }
        },
      }),
    [listenersRef, stateRef, onOpenChange, onValueChange, onComplete, onSkip],
  );

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

  useIsomorphicLayoutEffect(() => {
    store.setState("dir", dir);
  }, [dir, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("showBackdrop", showBackdrop);
  }, [showBackdrop, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("closeOnBackdropClick", closeOnBackdropClick);
  }, [closeOnBackdropClick, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("closeOnEscape", closeOnEscape);
  }, [closeOnEscape, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("padding", padding);
  }, [padding, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("borderRadius", borderRadius);
  }, [borderRadius, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("scrollToElement", scrollToElementProp);
  }, [scrollToElementProp, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("scrollBehavior", scrollBehavior);
  }, [scrollBehavior, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("scrollOffset", {
      top: 100,
      bottom: 100,
      left: 0,
      right: 0,
      ...scrollOffset,
    });
  }, [scrollOffset, store]);

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
      <TourContext.Provider value={stepFooter}>
        <RootPrimitive data-slot="tour" {...rootProps} />
      </TourContext.Provider>
    </StoreContext.Provider>
  );
}

interface TourStepProps extends DivProps {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  placement?: Placement;
  offset?: number;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
  required?: boolean;
  forceMount?: boolean;
}

function TourStep(props: TourStepProps) {
  const {
    target,
    placement = "bottom",
    offset = 8,
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

  const hasStepFooter = React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;
    return child.type === TourFooter;
  });

  const stepData: StepData = {
    target,
    placement,
    offset,
    onStepEnter,
    onStepLeave,
    required,
  };

  useIsomorphicLayoutEffect(() => {
    const index = store.addStep(stepData);
    stepIndexRef.current = index;

    const state = store.getState();
    if (index === 0 && state.open) {
      queueMicrotask(() => {
        updatePositionAndMask(store, stepData);
      });
    }

    return () => {
      store.removeStep(stepIndexRef.current);
    };
  }, [store, target, placement, offset, required, onStepEnter, onStepLeave]);

  const open = useStore((state) => state.open);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);
  const position = useStore((state) => state.position);
  const stepFooter = useTourContext(STEP_NAME);

  const currentStepData = steps[value];
  const targetElement = currentStepData
    ? getTargetElement(currentStepData.target)
    : null;

  const isCurrentStep = stepIndexRef.current === value;

  React.useEffect(() => {
    if (!open || !currentStepData || !targetElement || !isCurrentStep) return;

    function updatePosition() {
      if (currentStepData) {
        updatePositionAndMask(store, currentStepData);
      }
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, currentStepData, targetElement, store, isCurrentStep]);

  if (
    !open ||
    !currentStepData ||
    (!targetElement && !forceMount) ||
    !isCurrentStep
  ) {
    return null;
  }

  const StepPrimitive = asChild ? Slot : "div";

  return (
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
        transform: getTransform(currentStepData.placement),
      }}
    >
      {children}
      {!hasStepFooter && stepFooter && stepFooter}
    </StepPrimitive>
  );
}

function TourOverlay(props: DivProps) {
  const { asChild, className, style, ...backdropProps } = props;

  const store = useStoreContext(OVERLAY_NAME);
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

  const OverlayPrimitive = asChild ? Slot : "div";

  return (
    <OverlayPrimitive
      data-slot="tour-overlay"
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
  TourNavigation as Navigation,
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
  TourNavigation,
  TourPrev,
  TourNext,
  TourSkip,
  //
  type TourRootProps as TourProps,
};
