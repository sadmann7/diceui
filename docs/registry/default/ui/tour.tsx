"use client";

import {
  autoUpdate,
  flip,
  hide,
  limitShift,
  type Middleware,
  offset,
  arrow as onArrow,
  type Placement,
  shift,
  useFloating,
} from "@floating-ui/react-dom";
import { Slot } from "@radix-ui/react-slot";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Tour";
const PORTAL_NAME = "TourPortal";
const SPOTLIGHT_NAME = "TourSpotlight";
const STEP_NAME = "TourStep";
const CLOSE_NAME = "TourClose";
const PREV_NAME = "TourPrev";
const NEXT_NAME = "TourNext";
const SKIP_NAME = "TourSkip";
const HEADER_NAME = "TourHeader";
const TITLE_NAME = "TourTitle";
const DESCRIPTION_NAME = "TourDescription";
const FOOTER_NAME = "TourFooter";
const ARROW_NAME = "TourArrow";

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

const DEFAULT_ALIGN_OFFSET = 0;
const DEFAULT_SIDE_OFFSET = 12;
const DEFAULT_SPOTLIGHT_PADDING = 4;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];
type Direction = "ltr" | "rtl";

type SpotlightElement = React.ComponentRef<typeof TourSpotlight>;
type CloseElement = React.ComponentRef<typeof TourClose>;
type PrevElement = React.ComponentRef<typeof TourPrev>;
type NextElement = React.ComponentRef<typeof TourNext>;
type SkipElement = React.ComponentRef<typeof TourSkip>;
type FooterElement = React.ComponentRef<typeof TourFooter>;
type StepElement = React.ComponentRef<typeof TourStep>;

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsomorphicLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

function useLazyRef<T>(fn: () => T) {
  const ref = React.useRef<T | null>(null);

  if (ref.current === null) {
    ref.current = fn();
  }

  return ref as React.RefObject<T>;
}

const DirectionContext = React.createContext<Direction | undefined>(undefined);

function useDirection(dirProp?: Direction): Direction {
  const contextDir = React.useContext(DirectionContext);
  return dirProp ?? contextDir ?? "ltr";
}

interface ScrollOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

type Boundary = Element | null;

interface StepData {
  target: string | React.RefObject<HTMLElement> | HTMLElement;
  align?: Align;
  alignOffset?: number;
  side?: Side;
  sideOffset?: number;
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

interface StoreState {
  open: boolean;
  value: number;
  steps: StepData[];
  maskPath: string;
  spotlightRect: { x: number; y: number; width: number; height: number } | null;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(
    key: K,
    value: StoreState[K],
    opts?: unknown,
  ) => void;
  notify: () => void;
  addStep: (stepData: StepData) => { id: string; index: number };
  removeStep: (id: string) => void;
}

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

function onScrollToElement(
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
  padding: number = DEFAULT_SPOTLIGHT_PADDING,
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
  store.setState("spotlightRect", { x, y, width, height });
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface TourContextValue {
  dir: Direction;
  alignOffset: number;
  sideOffset: number;
  spotlightPadding: number;
  dismissible: boolean;
  modal: boolean;
  stepFooter?: React.ReactElement;
}

const TourContext = React.createContext<TourContextValue | null>(null);

function useTourContext(consumerName: string) {
  const context = React.useContext(TourContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface StepContextValue {
  arrowX?: number;
  arrowY?: number;
  placedAlign: Align;
  placedSide: Side;
  shouldHideArrow: boolean;
  onArrowChange: (arrow: HTMLSpanElement | null) => void;
  onFooterChange: (footer: FooterElement | null) => void;
}

const StepContext = React.createContext<StepContextValue | null>(null);

function useStepContext(consumerName: string) {
  const context = React.useContext(StepContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${STEP_NAME}\``);
  }
  return context;
}

const DefaultFooterContext = React.createContext(false);

interface PortalContextValue {
  portal: HTMLElement | null;
  onPortalChange: (node: HTMLElement | null) => void;
}

const PortalContext = React.createContext<PortalContextValue | null>(null);

function usePortalContext(consumerName: string) {
  const context = React.useContext(PortalContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

function useScrollLock(enabled: boolean) {
  React.useEffect(() => {
    if (!enabled) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = "";
    };
  }, [enabled]);
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
  alignOffset?: number;
  sideOffset?: number;
  spotlightPadding?: number;
  scrollToElement?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollOffset?: ScrollOffset;
  dismissible?: boolean;
  modal?: boolean;
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
    scrollToElement = false,
    scrollBehavior = "smooth",
    scrollOffset,
    ...rootProps
  } = props;

  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen,
    value: valueProp ?? defaultValue,
    steps: [],
    maskPath: "",
    spotlightRect: null,
  }));
  const listenersRef = useLazyRef<Set<() => void>>(() => new Set());
  const stepIdsMapRef = useLazyRef<Map<string, number>>(() => new Map());
  const stepIdCounterRef = useLazyRef(() => ({ current: 0 }));
  const propsRef = useAsRef({
    valueProp,
    onOpenChange,
    onValueChange,
    onComplete,
    onSkip,
    scrollToElement,
    scrollBehavior,
    scrollOffset,
  });

  const store: Store = React.useMemo(
    () => ({
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => {
        return stateRef.current;
      },
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;
        stateRef.current[key] = value;

        if (key === "open" && typeof value === "boolean") {
          propsRef.current.onOpenChange?.(value);

          if (value) {
            if (stateRef.current.steps.length > 0) {
              if (stateRef.current.value >= stateRef.current.steps.length) {
                store.setState("value", 0);
              }
            }
          } else {
            if (
              stateRef.current.value <
              (stateRef.current.steps.length || 0) - 1
            ) {
              propsRef.current.onSkip?.();
            }
          }
        } else if (key === "value" && typeof value === "number") {
          const prevStep = stateRef.current.steps[stateRef.current.value];
          const nextStep = stateRef.current.steps[value];

          prevStep?.onStepLeave?.();
          nextStep?.onStepEnter?.();

          if (propsRef.current.valueProp !== undefined) {
            propsRef.current.onValueChange?.(value);
            return;
          }

          propsRef.current.onValueChange?.(value);

          if (value >= stateRef.current.steps.length) {
            propsRef.current.onComplete?.();
            store.setState("open", false);
            return;
          }

          if (nextStep && propsRef.current.scrollToElement) {
            const targetElement = getTargetElement(nextStep.target);
            if (targetElement) {
              onScrollToElement(
                targetElement,
                propsRef.current.scrollBehavior,
                propsRef.current.scrollOffset,
              );
            }
          }
        }

        store.notify();
      },
      notify: () => {
        listenersRef.current.forEach((l) => {
          l();
        });
      },
      addStep: (stepData) => {
        const id = `step-${stepIdCounterRef.current.current++}`;
        const index = stateRef.current.steps.length;
        stepIdsMapRef.current.set(id, index);
        stateRef.current.steps = [...stateRef.current.steps, stepData];
        store.notify();
        return { id, index };
      },
      removeStep: (id) => {
        const index = stepIdsMapRef.current.get(id);
        if (index === undefined) return;

        stateRef.current.steps = stateRef.current.steps.filter(
          (_, i) => i !== index,
        );

        stepIdsMapRef.current.delete(id);

        for (const [stepId, stepIndex] of stepIdsMapRef.current.entries()) {
          if (stepIndex > index) {
            stepIdsMapRef.current.set(stepId, stepIndex - 1);
          }
        }

        store.notify();
      },
    }),
    [stateRef, listenersRef, stepIdsMapRef, stepIdCounterRef, propsRef],
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

  return (
    <StoreContext.Provider value={store}>
      <TourRootImpl {...rootProps} />
    </StoreContext.Provider>
  );
}

interface TourRootImplProps
  extends Omit<
    TourRootProps,
    | "open"
    | "defaultOpen"
    | "onOpenChange"
    | "value"
    | "defaultValue"
    | "onValueChange"
    | "onComplete"
    | "onSkip"
    | "scrollToElement"
    | "scrollBehavior"
    | "scrollOffset"
  > {}

function TourRootImpl(props: TourRootImplProps) {
  const {
    onEscapeKeyDown,
    dir: dirProp,
    alignOffset = DEFAULT_ALIGN_OFFSET,
    sideOffset = DEFAULT_SIDE_OFFSET,
    spotlightPadding = DEFAULT_SPOTLIGHT_PADDING,
    dismissible = true,
    modal = true,
    stepFooter,
    asChild,
    ...rootImplProps
  } = props;

  const store = useStoreContext("TourRootImpl");
  const dir = useDirection(dirProp);

  const [portal, setPortal] = React.useState<HTMLElement | null>(null);

  const onEscapeKeyDownRef = useAsRef(onEscapeKeyDown);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (store.getState().open && event.key === "Escape") {
        if (onEscapeKeyDownRef.current) {
          onEscapeKeyDownRef.current(event);
          if (event.defaultPrevented) return;
        }
        store.setState("open", false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store, onEscapeKeyDownRef]);

  const contextValue = React.useMemo<TourContextValue>(
    () => ({
      dir,
      alignOffset,
      sideOffset,
      spotlightPadding,
      dismissible,
      modal,
      stepFooter,
    }),
    [
      dir,
      alignOffset,
      sideOffset,
      spotlightPadding,
      dismissible,
      modal,
      stepFooter,
    ],
  );

  const portalContextValue = React.useMemo<PortalContextValue>(
    () => ({
      portal,
      onPortalChange: setPortal,
    }),
    [portal],
  );

  const open = useStore((state) => state.open);
  useScrollLock(open && modal);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <TourContext.Provider value={contextValue}>
      <PortalContext.Provider value={portalContextValue}>
        <RootPrimitive data-slot="tour" dir={dir} {...rootImplProps} />
      </PortalContext.Provider>
    </TourContext.Provider>
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
  required?: boolean;
  forceMount?: boolean;
  onStepEnter?: () => void;
  onStepLeave?: () => void;
}

function TourStep(props: TourStepProps) {
  const {
    target,
    side = "bottom",
    sideOffset,
    align = "center",
    alignOffset,
    collisionBoundary = [],
    collisionPadding = 0,
    arrowPadding = 0,
    sticky = "partial",
    hideWhenDetached = false,
    avoidCollisions = true,
    required = false,
    forceMount = false,
    onStepEnter,
    onStepLeave,
    children,
    className,
    style,
    asChild,
    ...stepProps
  } = props;

  const [arrow, setArrow] = React.useState<HTMLSpanElement | null>(null);
  const [footer, setFooter] = React.useState<FooterElement | null>(null);
  const stepRef = React.useRef<StepElement | null>(null);

  const store = useStoreContext(STEP_NAME);
  const stepIdRef = React.useRef<string>("");
  const stepOrderRef = React.useRef<number>(-1);

  const open = useStore((state) => state.open);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);
  const context = useTourContext(STEP_NAME);

  const resolvedSideOffset = sideOffset ?? context.sideOffset;
  const resolvedAlignOffset = alignOffset ?? context.alignOffset;

  useIsomorphicLayoutEffect(() => {
    const { id, index } = store.addStep({
      target,
      align,
      alignOffset: resolvedAlignOffset,
      side,
      sideOffset: resolvedSideOffset,
      collisionBoundary,
      collisionPadding,
      arrowPadding,
      sticky,
      hideWhenDetached,
      avoidCollisions,
      onStepEnter,
      onStepLeave,
      required,
    });
    stepIdRef.current = id;
    stepOrderRef.current = index;

    return () => {
      store.removeStep(stepIdRef.current);
    };
  }, [
    target,
    side,
    resolvedSideOffset,
    align,
    resolvedAlignOffset,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    avoidCollisions,
    required,
    onStepEnter,
    onStepLeave,
    store,
  ]);

  const stepData = steps[value];
  const targetElement = stepData ? getTargetElement(stepData.target) : null;

  const isCurrentStep = stepOrderRef.current === value;

  const middleware = React.useMemo(() => {
    if (!stepData) return [];

    const mainAxisOffset = stepData.sideOffset ?? resolvedSideOffset;
    const crossAxisOffset = stepData.alignOffset ?? resolvedAlignOffset;

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
      arrow && onArrow({ element: arrow, padding: stepData.arrowPadding }),
      stepData.hideWhenDetached &&
        hide({
          strategy: "referenceHidden",
          ...detectOverflowOptions,
        }),
    ].filter(Boolean) as Middleware[];
  }, [stepData, resolvedSideOffset, resolvedAlignOffset, arrow]);

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

  const composedRef = useComposedRefs(refs.setFloating, stepRef);

  const [placedSide, placedAlign] =
    getSideAndAlignFromPlacement(finalPlacement);

  const arrowX = middlewareData.arrow?.x;
  const arrowY = middlewareData.arrow?.y;
  const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;

  const stepContextValue = React.useMemo<StepContextValue>(
    () => ({
      arrowX,
      arrowY,
      placedAlign,
      placedSide,
      shouldHideArrow: cannotCenterArrow,
      onArrowChange: setArrow,
      onFooterChange: setFooter,
    }),
    [arrowX, arrowY, placedSide, placedAlign, cannotCenterArrow],
  );

  React.useEffect(() => {
    if (open && targetElement && isCurrentStep) {
      updateMask(store, targetElement, context.spotlightPadding);

      function onResize() {
        if (targetElement) {
          updateMask(store, targetElement, context.spotlightPadding);
        }
      }

      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }
  }, [open, targetElement, isCurrentStep, store, context.spotlightPadding]);

  useFocusTrap(stepRef, open && isCurrentStep);

  if (!open || !stepData || (!targetElement && !forceMount) || !isCurrentStep) {
    return null;
  }

  const isHidden = hideWhenDetached && middlewareData.hide?.referenceHidden;

  const StepPrimitive = asChild ? Slot : "div";

  return (
    <StepContext.Provider value={stepContextValue}>
      <StepPrimitive
        ref={composedRef}
        data-slot="tour-step"
        data-side={placedSide}
        data-align={placedAlign}
        dir={context.dir}
        tabIndex={-1}
        {...stepProps}
        className={cn(
          "fixed z-50 flex w-80 flex-col gap-4 rounded-lg border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          className,
        )}
        style={{
          ...style,
          ...floatingStyles,
          visibility: isHidden ? "hidden" : undefined,
          pointerEvents: isHidden ? "none" : undefined,
        }}
      >
        {children}
        {!footer && (
          <DefaultFooterContext.Provider value={true}>
            {context.stepFooter}
          </DefaultFooterContext.Provider>
        )}
      </StepPrimitive>
    </StepContext.Provider>
  );
}

interface TourSpotlightProps extends DivProps {
  forceMount?: boolean;
}

function TourSpotlight(props: TourSpotlightProps) {
  const {
    asChild,
    className,
    style,
    forceMount = false,
    onClick: onClickProp,
    ...backdropProps
  } = props;

  const { dismissible } = useTourContext(SPOTLIGHT_NAME);
  const store = useStoreContext(SPOTLIGHT_NAME);
  const open = useStore((state) => state.open);
  const maskPath = useStore((state) => state.maskPath);

  const onClick = React.useCallback(
    (event: React.MouseEvent<SpotlightElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented || !dismissible) return;

      store.setState("open", false);
    },
    [store, onClickProp, dismissible],
  );

  if (!open && !forceMount) return null;

  const SpotlightPrimitive = asChild ? Slot : "div";

  return (
    <SpotlightPrimitive
      data-state={open ? "open" : "closed"}
      data-slot="tour-spotlight"
      {...backdropProps}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      style={{
        clipPath: maskPath,
        ...style,
      }}
      onClick={onClick}
    />
  );
}

interface TourSpotlightRingProps extends DivProps {
  forceMount?: boolean;
}

function TourSpotlightRing(props: TourSpotlightRingProps) {
  const { asChild, className, style, forceMount = false, ...ringProps } = props;

  const open = useStore((state) => state.open);
  const spotlightRect = useStore((state) => state.spotlightRect);

  if (!open && !forceMount) return null;
  if (!spotlightRect) return null;

  const RingPrimitive = asChild ? Slot : "div";

  return (
    <RingPrimitive
      data-state={open ? "open" : "closed"}
      data-slot="tour-spotlight-ring"
      {...ringProps}
      className={cn(
        "pointer-events-none fixed z-50 border-ring ring-[3px] ring-ring/50 transition-all duration-250",
        className,
      )}
      style={{
        left: spotlightRect.x,
        top: spotlightRect.y,
        width: spotlightRect.width,
        height: spotlightRect.height,
        ...style,
      }}
    />
  );
}

interface TourPortalProps {
  children?: React.ReactNode;
  container?: HTMLElement | null;
}

function TourPortal(props: TourPortalProps) {
  const { children, container } = props;

  const portalContext = usePortalContext(PORTAL_NAME);

  const [mounted, setMounted] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);

    const node = container ?? document.body;

    portalContext?.onPortalChange(node);
    return () => {
      portalContext?.onPortalChange(null);
    };
  }, [container, portalContext]);

  if (!mounted) return null;

  const portalContainer = container ?? portalContext?.portal ?? document.body;

  return ReactDOM.createPortal(children, portalContainer);
}

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const previousActiveElement = document.activeElement as HTMLElement;

    function getFocusableElements() {
      const selector =
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
      return Array.from(
        container.querySelectorAll<HTMLElement>(selector),
      ).filter((element) => {
        return (
          element.offsetParent !== null &&
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true"
        );
      });
    }

    function onTabKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0]?.focus();
    } else {
      container.focus();
    }

    container.addEventListener("keydown", onTabKeyDown);

    return () => {
      container.removeEventListener("keydown", onTabKeyDown);
      if (
        previousActiveElement &&
        document.body.contains(previousActiveElement)
      ) {
        previousActiveElement.focus();
      }
    };
  }, [containerRef, enabled]);
}

function TourHeader(props: DivProps) {
  const { asChild, className, ...headerProps } = props;

  const context = useTourContext(HEADER_NAME);

  const HeaderPrimitive = asChild ? Slot : "div";

  return (
    <HeaderPrimitive
      data-slot="tour-header"
      dir={context.dir}
      {...headerProps}
      className={cn(
        "flex flex-col gap-1.5 text-center sm:text-left",
        className,
      )}
    />
  );
}

function TourTitle(props: DivProps) {
  const { asChild, className, ...titleProps } = props;

  const context = useTourContext(TITLE_NAME);

  const TitlePrimitive = asChild ? Slot : "div";

  return (
    <TitlePrimitive
      data-slot="tour-title"
      dir={context.dir}
      {...titleProps}
      className={cn(
        "font-semibold text-lg leading-none tracking-tight",
        className,
      )}
    />
  );
}

function TourDescription(props: DivProps) {
  const { asChild, className, ...descriptionProps } = props;

  const context = useTourContext(DESCRIPTION_NAME);

  const DescriptionPrimitive = asChild ? Slot : "div";

  return (
    <DescriptionPrimitive
      data-slot="tour-description"
      dir={context.dir}
      {...descriptionProps}
      className={cn("text-muted-foreground text-sm", className)}
    />
  );
}

function TourFooter(props: DivProps) {
  const { asChild, className, ref, ...footerProps } = props;

  const stepContext = useStepContext(FOOTER_NAME);
  const hasDefaultFooter = React.useContext(DefaultFooterContext);
  const context = useTourContext(FOOTER_NAME);

  const composedRef = useComposedRefs(
    ref,
    hasDefaultFooter ? undefined : stepContext.onFooterChange,
  );

  const FooterPrimitive = asChild ? Slot : "div";

  return (
    <FooterPrimitive
      data-slot="tour-footer"
      dir={context.dir}
      {...footerProps}
      ref={composedRef}
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
    />
  );
}

interface TourCloseProps extends React.ComponentProps<"button"> {
  asChild?: boolean;
}

function TourClose(props: TourCloseProps) {
  const {
    asChild,
    className,
    onClick: onClickProp,
    ...closeButtonProps
  } = props;

  const store = useStoreContext(CLOSE_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<CloseElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [store, onClickProp],
  );

  const ClosePrimitive = asChild ? Slot : "button";

  return (
    <ClosePrimitive
      type="button"
      aria-label="Close tour"
      className={cn(
        "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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

function TourPrev(props: React.ComponentProps<typeof Button>) {
  const { children, onClick: onClickProp, ...prevButtonProps } = props;

  const store = useStoreContext(PREV_NAME);
  const value = useStore((state) => state.value);

  const onClick = React.useCallback(
    (event: React.MouseEvent<PrevElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      if (value > 0) {
        store.setState("value", value - 1);
      }
    },
    [value, store, onClickProp],
  );

  return (
    <Button
      type="button"
      aria-label="Previous step"
      data-slot="tour-prev"
      variant="outline"
      {...prevButtonProps}
      onClick={onClick}
      disabled={value === 0}
    >
      {children ?? (
        <>
          <ChevronLeft />
          Previous
        </>
      )}
    </Button>
  );
}

function TourNext(props: React.ComponentProps<typeof Button>) {
  const { children, onClick: onClickProp, ...nextButtonProps } = props;
  const store = useStoreContext(NEXT_NAME);
  const value = useStore((state) => state.value);
  const steps = useStore((state) => state.steps);

  const isLastStep = value === steps.length - 1;

  const onClick = React.useCallback(
    (event: React.MouseEvent<NextElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      store.setState("value", value + 1);
    },
    [value, store, onClickProp],
  );

  return (
    <Button
      type="button"
      aria-label="Next step"
      data-slot="tour-next"
      {...nextButtonProps}
      onClick={onClick}
    >
      {children ?? (
        <>
          {isLastStep ? "Finish" : "Next"}
          {!isLastStep && <ChevronRight />}
        </>
      )}
    </Button>
  );
}

function TourSkip(props: React.ComponentProps<typeof Button>) {
  const { children, onClick: onClickProp, ...skipButtonProps } = props;

  const store = useStoreContext(SKIP_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<SkipElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [store, onClickProp],
  );

  return (
    <Button
      type="button"
      aria-label="Skip tour"
      data-slot="tour-skip"
      variant="outline"
      {...skipButtonProps}
      onClick={onClick}
    >
      {children ?? "Skip"}
    </Button>
  );
}

interface TourArrowProps extends React.ComponentProps<"svg"> {
  width?: number;
  height?: number;
  asChild?: boolean;
}

function TourArrow(props: TourArrowProps) {
  const {
    width = 10,
    height = 5,
    className,
    children,
    asChild,
    ...arrowProps
  } = props;

  const stepContext = useStepContext(ARROW_NAME);
  const baseSide = OPPOSITE_SIDE[stepContext.placedSide];

  return (
    <span
      ref={stepContext.onArrowChange}
      data-slot="tour-arrow"
      style={{
        position: "absolute",
        left:
          stepContext.arrowX != null ? `${stepContext.arrowX}px` : undefined,
        top: stepContext.arrowY != null ? `${stepContext.arrowY}px` : undefined,
        [baseSide]: 0,
        transformOrigin: {
          top: "",
          right: "0 0",
          bottom: "center 0",
          left: "100% 0",
        }[stepContext.placedSide],
        transform: {
          top: "translateY(100%)",
          right: "translateY(50%) rotate(90deg) translateX(-50%)",
          bottom: "rotate(180deg)",
          left: "translateY(50%) rotate(-90deg) translateX(50%)",
        }[stepContext.placedSide],
        visibility: stepContext.shouldHideArrow ? "hidden" : undefined,
      }}
    >
      <svg
        viewBox="0 0 30 10"
        preserveAspectRatio="none"
        width={width}
        height={height}
        {...arrowProps}
        className={cn("block fill-popover stroke-border", className)}
      >
        {asChild ? children : <polygon points="0,0 30,0 15,10" />}
      </svg>
    </span>
  );
}

export {
  TourRoot as Root,
  TourPortal as Portal,
  TourSpotlight as Spotlight,
  TourSpotlightRing as SpotlightRing,
  TourStep as Step,
  TourHeader as Header,
  TourTitle as Title,
  TourDescription as Description,
  TourFooter as Footer,
  TourClose as Close,
  TourStepCounter as StepCounter,
  TourPrev as Prev,
  TourNext as Next,
  TourSkip as Skip,
  TourArrow as Arrow,
  //
  TourRoot as Tour,
  TourPortal,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourHeader,
  TourTitle,
  TourDescription,
  TourFooter,
  TourClose,
  TourStepCounter,
  TourPrev,
  TourNext,
  TourSkip,
  TourArrow,
  //
  type TourRootProps as TourProps,
};
