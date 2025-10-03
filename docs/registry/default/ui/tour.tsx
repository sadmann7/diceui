"use client";

import { Slot } from "@radix-ui/react-slot";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Tour";
const STEP_NAME = "TourStep";
const CONTENT_NAME = "TourContent";
const HEADER_NAME = "TourHeader";
const TITLE_NAME = "TourTitle";
const DESCRIPTION_NAME = "TourDescription";
const FOOTER_NAME = "TourFooter";
const CLOSE_BUTTON_NAME = "TourCloseButton";
const STEP_COUNTER_NAME = "TourStepCounter";
const NAVIGATION_NAME = "TourNavigation";
const PREV_BUTTON_NAME = "TourPrevButton";
const NEXT_BUTTON_NAME = "TourNextButton";
const SKIP_BUTTON_NAME = "TourSkipButton";
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

function useStoreSelector<T>(
  store: Store,
  selector: (state: StoreState) => T,
): T {
  const selectorRef = React.useRef(selector);
  const snapshotRef = React.useRef<T | undefined>(undefined);
  const hasSnapshotRef = React.useRef(false);

  let snapshot: T;
  if (hasSnapshotRef.current && Object.is(selector, selectorRef.current)) {
    snapshot = snapshotRef.current as T;
  } else {
    snapshot = selector(store.getState());
    selectorRef.current = selector;
    snapshotRef.current = snapshot;
    hasSnapshotRef.current = true;
  }

  const getSnapshot = React.useCallback(() => {
    if (Object.is(selector, selectorRef.current)) {
      return snapshotRef.current as T;
    }
    const newSnapshot = selector(store.getState());
    selectorRef.current = selector;
    snapshotRef.current = newSnapshot;
    return newSnapshot;
  }, [selector, store]);

  const subscribe = React.useCallback(
    (callback: () => void) => store.subscribe(callback),
    [store],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
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

const TourContext = React.createContext<Store | null>(null);

function useTourContext(consumerName: string) {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

const StepContext = React.createContext<{
  stepIndex: number;
  stepData: StepData;
} | null>(null);

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
    asChild,
    children,
    ref,
    ...rootProps
  } = props;
  const [openState, setOpenState] = React.useState(defaultOpen);
  const [currentStepState, setCurrentStepState] =
    React.useState(defaultCurrentStep);

  const open = openProp ?? openState;
  const currentStep = currentStepProp ?? currentStepState;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef(
    (): StoreState => ({
      open,
      currentStep,
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
    }),
  );

  const store = useLazyRef(() =>
    createStore(listenersRef, stateRef, {
      open: (value) => {
        if (openProp === undefined) {
          setOpenState(value);
        }
        onOpenChange?.(value);

        // If closing the tour, check if it was skipped
        if (!value && currentStep < (stateRef.current?.steps.length || 0) - 1) {
          onSkip?.();
        }
      },
      currentStep: (value, store) => {
        const state = store.getState();
        const prevStep = state.steps[currentStep];
        const nextStep = state.steps[value];

        prevStep?.onStepLeave?.();
        nextStep?.onStepEnter?.();

        if (currentStepProp === undefined) {
          setCurrentStepState(value);
        }
        onCurrentStepChange?.(value);

        // Handle completion
        if (value >= state.steps.length) {
          onComplete?.();
          store.setState("open", false);
          return;
        }

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
  );

  // Update store state when props change
  React.useEffect(() => {
    store.current.setState("open", open);
  }, [open, store]);

  React.useEffect(() => {
    store.current.setState("currentStep", currentStep);
  }, [currentStep, store]);

  React.useEffect(() => {
    store.current.setState("dir", dir);
  }, [dir, store]);

  React.useEffect(() => {
    store.current.setState("showBackdrop", showBackdrop);
  }, [showBackdrop, store]);

  React.useEffect(() => {
    store.current.setState("closeOnBackdropClick", closeOnBackdropClick);
  }, [closeOnBackdropClick, store]);

  React.useEffect(() => {
    store.current.setState("closeOnEscape", closeOnEscape);
  }, [closeOnEscape, store]);

  React.useEffect(() => {
    store.current.setState("padding", padding);
  }, [padding, store]);

  React.useEffect(() => {
    store.current.setState("borderRadius", borderRadius);
  }, [borderRadius, store]);

  React.useEffect(() => {
    store.current.setState("scrollToElement", scrollToElementProp);
  }, [scrollToElementProp, store]);

  React.useEffect(() => {
    store.current.setState("scrollBehavior", scrollBehavior);
  }, [scrollBehavior, store]);

  React.useEffect(() => {
    store.current.setState("scrollOffset", {
      top: 100,
      bottom: 100,
      left: 0,
      right: 0,
      ...scrollOffset,
    });
  }, [scrollOffset, store]);

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        store.current.setState("open", false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, closeOnEscape, store]);

  const Comp = asChild ? Slot : "div";

  return (
    <TourContext.Provider value={store.current}>
      <Comp ref={ref} {...rootProps}>
        {children}
      </Comp>
    </TourContext.Provider>
  );
}
TourRoot.displayName = ROOT_NAME;

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
    asChild,
    children,
    ref,
    ...stepProps
  } = props;
  const store = useTourContext(STEP_NAME);
  const stepIndex = React.useRef<number>(-1);

  // Register step with store
  React.useEffect(() => {
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

  const Comp = asChild ? Slot : "div";

  return (
    <StepContext.Provider value={{ stepIndex: stepIndex.current, stepData }}>
      <Comp ref={ref} {...stepProps}>
        {children}
      </Comp>
    </StepContext.Provider>
  );
}
TourStep.displayName = STEP_NAME;

interface TourContentProps extends DivProps {}

function TourContent(props: TourContentProps) {
  const { asChild, className, children, ref, ...contentProps } = props;
  const store = useTourContext(CONTENT_NAME);
  const { open, currentStep, steps } = useStoreSelector(store, (state) => ({
    open: state.open,
    currentStep: state.currentStep,
    steps: state.steps,
  }));

  const currentStepData = steps[currentStep];
  const targetElement = currentStepData
    ? getTargetElement(currentStepData.target)
    : null;

  const [position, setPosition] = React.useState({ top: 0, left: 0 });

  React.useEffect(() => {
    if (!open || !currentStepData || !targetElement) return;

    const updatePosition = () => {
      const rect = getElementRect(targetElement);
      const placement = currentStepData.placement || "bottom";
      const offset = currentStepData.offset || 8;

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

      setPosition({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [open, currentStepData, targetElement]);

  if (
    !open ||
    !currentStepData ||
    (!targetElement && !currentStepData.showOnTargetNotFound)
  ) {
    return null;
  }

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        "fixed z-50 w-80 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md",
        className,
      )}
      style={{
        top: position.top,
        left: position.left,
        transform: "translate(-50%, -100%)",
      }}
      {...contentProps}
    >
      {children}
    </Comp>
  );
}
TourContent.displayName = CONTENT_NAME;

interface TourBackdropProps extends DivProps {}

function TourBackdrop(props: TourBackdropProps) {
  const { asChild, className, children, ref, ...backdropProps } = props;
  const store = useTourContext(BACKDROP_NAME);
  const {
    open,
    showBackdrop,
    closeOnBackdropClick,
    currentStep,
    steps,
    padding,
  } = useStoreSelector(store, (state) => ({
    open: state.open,
    showBackdrop: state.showBackdrop,
    closeOnBackdropClick: state.closeOnBackdropClick,
    currentStep: state.currentStep,
    steps: state.steps,
    padding: state.padding,
  }));

  const currentStepData = steps[currentStep];
  const targetElement = currentStepData
    ? getTargetElement(currentStepData.target)
    : null;

  const [maskPath, setMaskPath] = React.useState("");

  React.useEffect(() => {
    if (!open || !showBackdrop || !targetElement) {
      setMaskPath("");
      return;
    }

    const updateMask = () => {
      const rect = targetElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      const x = Math.max(0, rect.left - padding);
      const y = Math.max(0, rect.top - padding);
      const width = Math.min(viewportWidth - x, rect.width + padding * 2);
      const height = Math.min(viewportHeight - y, rect.height + padding * 2);

      const path = `polygon(0% 0%, 0% 100%, ${x}px 100%, ${x}px ${y}px, ${x + width}px ${y}px, ${x + width}px ${y + height}px, ${x}px ${y + height}px, ${x}px 100%, 100% 100%, 100% 0%)`;
      setMaskPath(path);
    };

    updateMask();
    window.addEventListener("resize", updateMask);
    window.addEventListener("scroll", updateMask);

    return () => {
      window.removeEventListener("resize", updateMask);
      window.removeEventListener("scroll", updateMask);
    };
  }, [open, showBackdrop, targetElement, padding]);

  const handleBackdropClick = () => {
    if (closeOnBackdropClick) {
      store.setState("open", false);
    }
  };

  if (!open || !showBackdrop) {
    return null;
  }

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn("fixed inset-0 z-40 bg-black/50", className)}
      style={{
        clipPath: maskPath,
      }}
      onClick={handleBackdropClick}
      {...backdropProps}
    >
      {children}
    </Comp>
  );
}
TourBackdrop.displayName = BACKDROP_NAME;

interface TourHeaderProps extends DivProps {}

function TourHeader(props: TourHeaderProps) {
  const { asChild, className, children, ref, ...headerProps } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left",
        className,
      )}
      {...headerProps}
    >
      {children}
    </Comp>
  );
}
TourHeader.displayName = HEADER_NAME;

interface TourTitleProps extends React.ComponentProps<"h2"> {
  asChild?: boolean;
}

function TourTitle(props: TourTitleProps) {
  const { asChild, className, children, ref, ...titleProps } = props;
  const Comp = asChild ? Slot : "h2";

  return (
    <Comp
      ref={ref}
      className={cn(
        "font-semibold text-lg leading-none tracking-tight",
        className,
      )}
      {...titleProps}
    >
      {children}
    </Comp>
  );
}
TourTitle.displayName = TITLE_NAME;

interface TourDescriptionProps extends React.ComponentProps<"p"> {
  asChild?: boolean;
}

function TourDescription(props: TourDescriptionProps) {
  const { asChild, className, children, ref, ...descriptionProps } = props;
  const Comp = asChild ? Slot : "p";

  return (
    <Comp
      ref={ref}
      className={cn("text-muted-foreground text-sm", className)}
      {...descriptionProps}
    >
      {children}
    </Comp>
  );
}
TourDescription.displayName = DESCRIPTION_NAME;

interface TourFooterProps extends DivProps {}

function TourFooter(props: TourFooterProps) {
  const { asChild, className, children, ref, ...footerProps } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className,
      )}
      {...footerProps}
    >
      {children}
    </Comp>
  );
}
TourFooter.displayName = FOOTER_NAME;

interface TourCloseButtonProps extends ButtonProps {}

function TourCloseButton(props: TourCloseButtonProps) {
  const { asChild, className, children, ref, ...closeButtonProps } = props;
  const store = useTourContext(CLOSE_BUTTON_NAME);

  const handleClick = () => {
    store.setState("open", false);
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type="button"
      className={cn(
        "absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className,
      )}
      aria-label="Close tour"
      onClick={handleClick}
      {...closeButtonProps}
    >
      {children || <X className="h-4 w-4" />}
    </Comp>
  );
}
TourCloseButton.displayName = CLOSE_BUTTON_NAME;

interface TourStepCounterProps extends DivProps {
  format?: (current: number, total: number) => string;
}

function TourStepCounter(props: TourStepCounterProps) {
  const {
    format = (current, total) => `${current} / ${total}`,
    asChild,
    className,
    children,
    ref,
    ...stepCounterProps
  } = props;
  const store = useTourContext(STEP_COUNTER_NAME);
  const { currentStep, steps } = useStoreSelector(store, (state) => ({
    currentStep: state.currentStep,
    steps: state.steps,
  }));

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn("text-muted-foreground text-sm", className)}
      {...stepCounterProps}
    >
      {children || format(currentStep + 1, steps.length)}
    </Comp>
  );
}
TourStepCounter.displayName = STEP_COUNTER_NAME;

interface TourNavigationProps extends DivProps {}

function TourNavigation(props: TourNavigationProps) {
  const { asChild, className, children, ref, ...navigationProps } = props;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={ref}
      className={cn("flex items-center justify-between", className)}
      {...navigationProps}
    >
      {children}
    </Comp>
  );
}
TourNavigation.displayName = NAVIGATION_NAME;

interface TourPrevButtonProps extends ButtonProps {}

function TourPrevButton(props: TourPrevButtonProps) {
  const { asChild, className, children, ref, ...prevButtonProps } = props;
  const store = useTourContext(PREV_BUTTON_NAME);
  const { currentStep } = useStoreSelector(store, (state) => ({
    currentStep: state.currentStep,
  }));

  const handleClick = () => {
    if (currentStep > 0) {
      store.setState("currentStep", currentStep - 1);
    }
  };

  const isDisabled = currentStep === 0;

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      aria-label="Previous step"
      disabled={isDisabled}
      onClick={handleClick}
      {...prevButtonProps}
    >
      {children || (
        <>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </>
      )}
    </Comp>
  );
}
TourPrevButton.displayName = PREV_BUTTON_NAME;

interface TourNextButtonProps extends ButtonProps {}

function TourNextButton(props: TourNextButtonProps) {
  const { asChild, className, children, ref, ...nextButtonProps } = props;
  const store = useTourContext(NEXT_BUTTON_NAME);
  const { currentStep, steps } = useStoreSelector(store, (state) => ({
    currentStep: state.currentStep,
    steps: state.steps,
  }));

  const handleClick = () => {
    store.setState("currentStep", currentStep + 1);
  };

  const isLastStep = currentStep === steps.length - 1;

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      aria-label="Next step"
      onClick={handleClick}
      {...nextButtonProps}
    >
      {children || (
        <>
          {isLastStep ? "Finish" : "Next"}
          {!isLastStep && <ChevronRight className="ml-2 h-4 w-4" />}
        </>
      )}
    </Comp>
  );
}
TourNextButton.displayName = NEXT_BUTTON_NAME;

interface TourSkipButtonProps extends ButtonProps {}

function TourSkipButton(props: TourSkipButtonProps) {
  const { asChild, className, children, ref, ...skipButtonProps } = props;
  const store = useTourContext(SKIP_BUTTON_NAME);

  const handleClick = () => {
    store.setState("open", false);
  };

  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 font-medium text-sm ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      aria-label="Skip tour"
      onClick={handleClick}
      {...skipButtonProps}
    >
      {children || "Skip"}
    </Comp>
  );
}
TourSkipButton.displayName = SKIP_BUTTON_NAME;

const Root = TourRoot;
const Step = TourStep;
const Content = TourContent;
const Backdrop = TourBackdrop;
const Header = TourHeader;
const Title = TourTitle;
const Description = TourDescription;
const Footer = TourFooter;
const CloseButton = TourCloseButton;
const StepCounter = TourStepCounter;
const Navigation = TourNavigation;
const PrevButton = TourPrevButton;
const NextButton = TourNextButton;
const SkipButton = TourSkipButton;

export {
  Root,
  Step,
  Content,
  Backdrop,
  Header,
  Title,
  Description,
  Footer,
  CloseButton,
  StepCounter,
  Navigation,
  PrevButton,
  NextButton,
  SkipButton,
  //
  TourRoot,
  TourStep,
  TourContent,
  TourBackdrop,
  TourHeader,
  TourTitle,
  TourDescription,
  TourFooter,
  TourCloseButton,
  TourStepCounter,
  TourNavigation,
  TourPrevButton,
  TourNextButton,
  TourSkipButton,
};
