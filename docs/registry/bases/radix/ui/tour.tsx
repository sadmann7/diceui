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
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/radix/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/radix/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/radix/hooks/use-lazy-ref";

const ROOT_NAME = "Tour";
const PORTAL_NAME = "TourPortal";
const STEP_NAME = "TourStep";
const ARROW_NAME = "TourArrow";
const HEADER_NAME = "TourHeader";
const TITLE_NAME = "TourTitle";
const DESCRIPTION_NAME = "TourDescription";
const CLOSE_NAME = "TourClose";
const PREV_NAME = "TourPrev";
const NEXT_NAME = "TourNext";
const SKIP_NAME = "TourSkip";
const FOOTER_NAME = "TourFooter";

const POINTER_DOWN_OUTSIDE = "tour.pointerDownOutside";
const INTERACT_OUTSIDE = "tour.interactOutside";
const OPEN_AUTO_FOCUS = "tour.openAutoFocus";
const CLOSE_AUTO_FOCUS = "tour.closeAutoFocus";
const EVENT_OPTIONS = { bubbles: false, cancelable: true };

const SIDE_OPTIONS = ["top", "right", "bottom", "left"] as const;
const ALIGN_OPTIONS = ["start", "center", "end"] as const;

const DEFAULT_ALIGN_OFFSET = 0;
const DEFAULT_SIDE_OFFSET = 16;
const DEFAULT_SPOTLIGHT_PADDING = 4;

type Side = (typeof SIDE_OPTIONS)[number];
type Align = (typeof ALIGN_OPTIONS)[number];
type Direction = "ltr" | "rtl";

interface ScrollOffset {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

type Boundary = Element | null;

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type StepElement = React.ComponentRef<typeof TourStep>;
type CloseElement = React.ComponentRef<typeof TourClose>;
type PrevElement = React.ComponentRef<typeof TourPrev>;
type NextElement = React.ComponentRef<typeof TourNext>;
type SkipElement = React.ComponentRef<typeof TourSkip>;
type FooterElement = React.ComponentRef<typeof TourFooter>;

const OPPOSITE_SIDE: Record<Side, Side> = {
  top: "bottom",
  right: "left",
  bottom: "top",
  left: "right",
};

/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/focus-guards/src/focus-guards.tsx
 */
let focusGuardCount = 0;

function createFocusGuard() {
  const element = document.createElement("span");
  element.setAttribute("data-tour-focus-guard", "");
  element.tabIndex = 0;
  element.style.outline = "none";
  element.style.opacity = "0";
  element.style.position = "fixed";
  element.style.pointerEvents = "none";
  return element;
}

function useFocusGuards() {
  React.useEffect(() => {
    const edgeGuards = document.querySelectorAll("[data-tour-focus-guard]");
    document.body.insertAdjacentElement(
      "afterbegin",
      edgeGuards[0] ?? createFocusGuard(),
    );
    document.body.insertAdjacentElement(
      "beforeend",
      edgeGuards[1] ?? createFocusGuard(),
    );
    focusGuardCount++;

    return () => {
      if (focusGuardCount === 1) {
        const guards = document.querySelectorAll("[data-tour-focus-guard]");
        for (const node of guards) {
          node.remove();
        }
      }
      focusGuardCount--;
    };
  }, []);
}

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  tourOpen: boolean,
  onOpenAutoFocus?: (event: OpenAutoFocusEvent) => void,
  onCloseAutoFocus?: (event: CloseAutoFocusEvent) => void,
) {
  const lastFocusedElementRef = React.useRef<HTMLElement | null>(null);
  const onOpenAutoFocusRef = useAsRef(onOpenAutoFocus);
  const onCloseAutoFocusRef = useAsRef(onCloseAutoFocus);
  const tourOpenRef = useAsRef(tourOpen);

  React.useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const previouslyFocusedElement =
      document.activeElement as HTMLElement | null;

    function getTabbableCandidates() {
      if (!container) return [];

      const nodes: HTMLElement[] = [];
      const walker = document.createTreeWalker(
        container,
        NodeFilter.SHOW_ELEMENT,
        {
          acceptNode: (node: Element) => {
            const element = node as HTMLElement;
            const isHiddenInput =
              element.tagName === "INPUT" &&
              (element as HTMLInputElement).type === "hidden";
            if (element.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
            return element.tabIndex >= 0
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_SKIP;
          },
        },
      );
      while (walker.nextNode()) {
        nodes.push(walker.currentNode as HTMLElement);
      }
      return nodes;
    }

    function getTabbableEdges() {
      const candidates = getTabbableCandidates();
      const first = candidates[0];
      const last = candidates[candidates.length - 1];
      return [first, last] as const;
    }

    function onFocusIn(event: FocusEvent) {
      if (!container) return;

      const target = event.target as HTMLElement | null;
      if (container.contains(target)) {
        lastFocusedElementRef.current = target;
      } else {
        const elementToFocus =
          lastFocusedElementRef.current ?? getTabbableCandidates()[0];
        elementToFocus?.focus({ preventScroll: true });
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" || event.altKey || event.ctrlKey || event.metaKey)
        return;

      const [first, last] = getTabbableEdges();
      const hasTabbableElements = first && last;

      if (!hasTabbableElements) {
        if (document.activeElement === container) event.preventDefault();
        return;
      }

      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus({ preventScroll: true });
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus({ preventScroll: true });
      }
    }

    const openAutoFocusEvent = new CustomEvent(OPEN_AUTO_FOCUS, EVENT_OPTIONS);
    if (onOpenAutoFocusRef.current) {
      container.addEventListener(
        OPEN_AUTO_FOCUS,
        onOpenAutoFocusRef.current as EventListener,
        { once: true },
      );
    }
    container.dispatchEvent(openAutoFocusEvent);

    if (!openAutoFocusEvent.defaultPrevented) {
      const tabbableCandidates = getTabbableCandidates();
      if (tabbableCandidates.length > 0) {
        tabbableCandidates[0]?.focus({ preventScroll: true });
      } else {
        container.focus({ preventScroll: true });
      }
    }

    document.addEventListener("focusin", onFocusIn);
    container.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("focusin", onFocusIn);
      container.removeEventListener("keydown", onKeyDown);

      if (!tourOpenRef.current) {
        setTimeout(() => {
          const closeAutoFocusEvent = new CustomEvent(
            CLOSE_AUTO_FOCUS,
            EVENT_OPTIONS,
          );
          if (onCloseAutoFocusRef.current) {
            container.addEventListener(
              CLOSE_AUTO_FOCUS,
              onCloseAutoFocusRef.current as EventListener,
              { once: true },
            );
          }
          container.dispatchEvent(closeAutoFocusEvent);

          if (!closeAutoFocusEvent.defaultPrevented) {
            if (
              previouslyFocusedElement &&
              document.body.contains(previouslyFocusedElement)
            ) {
              previouslyFocusedElement.focus({ preventScroll: true });
            }
          }

          if (onCloseAutoFocusRef.current) {
            container.removeEventListener(
              CLOSE_AUTO_FOCUS,
              onCloseAutoFocusRef.current as EventListener,
            );
          }
        }, 0);
      }
    };
  }, [
    containerRef,
    enabled,
    onOpenAutoFocusRef,
    onCloseAutoFocusRef,
    tourOpenRef,
  ]);
}

function getDataState(open: boolean) {
  return open ? "open" : "closed";
}

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

function useStore<T>(
  selector: (state: StoreState) => T,
  ogStore?: Store | null,
): T {
  const contextStore = React.useContext(StoreContext);

  const store = ogStore ?? contextStore;

  if (!store) {
    throw new Error(`\`useStore\` must be used within \`${ROOT_NAME}\``);
  }

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

function getDefaultScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

function onScrollToElement(
  element: HTMLElement,
  scrollBehavior: ScrollBehavior = getDefaultScrollBehavior(),
  scrollOffset?: ScrollOffset,
) {
  const offset: Required<ScrollOffset> = {
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
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
  onOpenAutoFocus?: (event: OpenAutoFocusEvent) => void;
  onCloseAutoFocus?: (event: CloseAutoFocusEvent) => void;
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

type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type InteractOutsideEvent = CustomEvent<{
  originalEvent: PointerEvent | FocusEvent;
}>;
type OpenAutoFocusEvent = CustomEvent<Record<string, never>>;
type CloseAutoFocusEvent = CustomEvent<Record<string, never>>;

interface TourProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: number;
  defaultValue?: number;
  onValueChange?: (step: number) => void;
  onComplete?: () => void;
  onSkip?: () => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onPointerDownOutside?: (event: PointerDownOutsideEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
  onOpenAutoFocus?: (event: OpenAutoFocusEvent) => void;
  onCloseAutoFocus?: (event: CloseAutoFocusEvent) => void;
  dir?: Direction;
  alignOffset?: number;
  sideOffset?: number;
  spotlightPadding?: number;
  autoScroll?: boolean;
  scrollBehavior?: ScrollBehavior;
  scrollOffset?: ScrollOffset;
  dismissible?: boolean;
  modal?: boolean;
  stepFooter?: React.ReactElement;
}

function Tour(props: TourProps) {
  const {
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    value: valueProp,
    defaultValue = 0,
    onValueChange,
    onComplete,
    onSkip,
    autoScroll = true,
    scrollBehavior = getDefaultScrollBehavior(),
    scrollOffset,
    onEscapeKeyDown,
    onPointerDownOutside,
    onInteractOutside,
    onOpenAutoFocus,
    onCloseAutoFocus,
    dir: dirProp,
    alignOffset = DEFAULT_ALIGN_OFFSET,
    sideOffset = DEFAULT_SIDE_OFFSET,
    spotlightPadding = DEFAULT_SPOTLIGHT_PADDING,
    dismissible = true,
    modal = true,
    stepFooter,
    asChild,
    ...rootProps
  } = props;

  const dir = DirectionPrimitive.useDirection(dirProp);

  const [portal, setPortal] = React.useState<HTMLElement | null>(null);
  const prevOpenRef = React.useRef<boolean | undefined>(undefined);
  const previouslyFocusedElementRef = React.useRef<HTMLElement | null>(null);

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
    onEscapeKeyDown,
    onCloseAutoFocus,
    autoScroll,
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

          if (value >= stateRef.current.steps.length) {
            propsRef.current.onComplete?.();

            if (propsRef.current.valueProp !== undefined) {
              propsRef.current.onValueChange?.(value);
            }

            store.setState("open", false);
            return;
          }

          if (propsRef.current.valueProp !== undefined) {
            propsRef.current.onValueChange?.(value);
            return;
          }

          propsRef.current.onValueChange?.(value);

          if (nextStep && propsRef.current.autoScroll) {
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

  const open = useStore((state) => state.open, store);

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (open && event.key === "Escape") {
        if (propsRef.current.onEscapeKeyDown) {
          propsRef.current.onEscapeKeyDown(event);
          if (event.defaultPrevented) return;
        }
        store.setState("open", false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [store, open, propsRef]);

  useIsomorphicLayoutEffect(() => {
    const wasOpen = prevOpenRef.current;

    if (open && !wasOpen) {
      previouslyFocusedElementRef.current =
        document.activeElement as HTMLElement | null;
    } else if (!open && wasOpen) {
      setTimeout(() => {
        const container = portal ?? document.body;
        const closeAutoFocusEvent = new CustomEvent(
          CLOSE_AUTO_FOCUS,
          EVENT_OPTIONS,
        );

        if (propsRef.current.onCloseAutoFocus) {
          container.addEventListener(
            CLOSE_AUTO_FOCUS,
            propsRef.current.onCloseAutoFocus as EventListener,
            { once: true },
          );
        }
        container.dispatchEvent(closeAutoFocusEvent);

        if (!closeAutoFocusEvent.defaultPrevented) {
          const elementToFocus = previouslyFocusedElementRef.current;
          if (elementToFocus && document.body.contains(elementToFocus)) {
            elementToFocus.focus({ preventScroll: true });
          }
        }

        previouslyFocusedElementRef.current = null;
      }, 0);
    }

    prevOpenRef.current = open;
  }, [open, portal, propsRef]);

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

  const contextValue = React.useMemo<TourContextValue>(
    () => ({
      dir,
      alignOffset,
      sideOffset,
      spotlightPadding,
      dismissible,
      modal,
      stepFooter,
      onPointerDownOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onCloseAutoFocus,
    }),
    [
      dir,
      alignOffset,
      sideOffset,
      spotlightPadding,
      dismissible,
      modal,
      stepFooter,
      onPointerDownOutside,
      onInteractOutside,
      onOpenAutoFocus,
      onCloseAutoFocus,
    ],
  );

  const portalContextValue = React.useMemo<PortalContextValue>(
    () => ({
      portal,
      onPortalChange: setPortal,
    }),
    [portal],
  );

  useScrollLock(open && modal);

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <TourContext.Provider value={contextValue}>
        <PortalContext.Provider value={portalContextValue}>
          <RootPrimitive data-slot="tour" dir={dir} {...rootProps} />
        </PortalContext.Provider>
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
    onPointerDownCapture: onPointerDownCaptureProp,
    onFocusCapture: onFocusCaptureProp,
    onBlurCapture: onBlurCaptureProp,
    children,
    className,
    style,
    asChild,
    ...stepProps
  } = props;

  const store = useStoreContext(STEP_NAME);

  const [arrow, setArrow] = React.useState<HTMLSpanElement | null>(null);
  const [footer, setFooter] = React.useState<FooterElement | null>(null);

  const stepRef = React.useRef<StepElement | null>(null);
  const stepIdRef = React.useRef<string>("");
  const stepOrderRef = React.useRef<number>(-1);
  const isPointerInsideReactTreeRef = React.useRef(false);
  const isFocusInsideReactTreeRef = React.useRef(false);

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
  const isHidden = hideWhenDetached && middlewareData.hide?.referenceHidden;

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

      let rafId: number | null = null;

      function onResize() {
        if (targetElement) {
          updateMask(store, targetElement, context.spotlightPadding);
        }
      }

      function onScroll() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
          if (targetElement) {
            updateMask(store, targetElement, context.spotlightPadding);
          }
          rafId = null;
        });
      }

      window.addEventListener("resize", onResize);
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("resize", onResize);
        window.removeEventListener("scroll", onScroll);
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
      };
    }
  }, [open, targetElement, isCurrentStep, store, context.spotlightPadding]);

  React.useEffect(() => {
    if (!open || !isCurrentStep) return;

    const stepElement = stepRef.current;
    if (!stepElement) return;

    const ownerDocument = stepElement.ownerDocument;

    function onPointerDown(event: PointerEvent) {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        const pointerDownOutsideEvent = new CustomEvent(POINTER_DOWN_OUTSIDE, {
          ...EVENT_OPTIONS,
          detail: { originalEvent: event },
        });

        context.onPointerDownOutside?.(pointerDownOutsideEvent);

        const interactOutsideEvent = new CustomEvent(INTERACT_OUTSIDE, {
          ...EVENT_OPTIONS,
          detail: { originalEvent: event },
        });
        context.onInteractOutside?.(interactOutsideEvent);

        if (
          !pointerDownOutsideEvent.defaultPrevented &&
          !interactOutsideEvent.defaultPrevented &&
          context.dismissible
        ) {
          store.setState("open", false);
        }
      }

      isPointerInsideReactTreeRef.current = false;
    }

    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open, isCurrentStep, store, context]);

  React.useEffect(() => {
    if (!open || !isCurrentStep) return;

    const stepElement = stepRef.current;
    if (!stepElement) return;

    const ownerDocument = stepElement.ownerDocument;

    function onFocusIn(event: FocusEvent) {
      const target = event.target as HTMLElement;

      const isFocusInStep = stepElement?.contains(target);
      const isFocusInTarget = targetElement?.contains(target);

      if (
        event.target &&
        !isFocusInsideReactTreeRef.current &&
        !isFocusInStep &&
        !isFocusInTarget
      ) {
        const interactOutsideEvent = new CustomEvent(INTERACT_OUTSIDE, {
          ...EVENT_OPTIONS,
          detail: { originalEvent: event },
        });

        context.onInteractOutside?.(interactOutsideEvent);

        if (!interactOutsideEvent.defaultPrevented && context.dismissible) {
          store.setState("open", false);
        }
      }
    }

    ownerDocument.addEventListener("focusin", onFocusIn);

    return () => {
      ownerDocument.removeEventListener("focusin", onFocusIn);
    };
  }, [open, isCurrentStep, store, context, targetElement]);

  const onPointerDownCapture = React.useCallback(
    (event: React.PointerEvent<StepElement>) => {
      onPointerDownCaptureProp?.(event);
      isPointerInsideReactTreeRef.current = true;
    },
    [onPointerDownCaptureProp],
  );

  const onFocusCapture = React.useCallback(
    (event: React.FocusEvent<StepElement>) => {
      onFocusCaptureProp?.(event);
      isFocusInsideReactTreeRef.current = true;
    },
    [onFocusCaptureProp],
  );

  const onBlurCapture = React.useCallback(
    (event: React.FocusEvent<StepElement>) => {
      onBlurCaptureProp?.(event);
      isFocusInsideReactTreeRef.current = false;
    },
    [onBlurCaptureProp],
  );

  React.useEffect(() => {
    if (!open || !isCurrentStep || !targetElement) return;

    function onTargetPointerDownCapture() {
      isPointerInsideReactTreeRef.current = true;
    }

    function onTargetFocusCapture() {
      isFocusInsideReactTreeRef.current = true;
    }

    function onTargetBlurCapture() {
      isFocusInsideReactTreeRef.current = false;
    }

    targetElement.addEventListener(
      "pointerdown",
      onTargetPointerDownCapture,
      true,
    );
    targetElement.addEventListener("focus", onTargetFocusCapture, true);
    targetElement.addEventListener("blur", onTargetBlurCapture, true);

    return () => {
      targetElement.removeEventListener(
        "pointerdown",
        onTargetPointerDownCapture,
        true,
      );
      targetElement.removeEventListener("focus", onTargetFocusCapture, true);
      targetElement.removeEventListener("blur", onTargetBlurCapture, true);
    };
  }, [open, isCurrentStep, targetElement]);

  useFocusGuards();
  useFocusTrap(
    stepRef,
    open && isCurrentStep,
    open,
    context.onOpenAutoFocus,
    context.onCloseAutoFocus,
  );

  if (!open || !stepData || (!targetElement && !forceMount) || !isCurrentStep) {
    return null;
  }

  const StepPrimitive = asChild ? SlotPrimitive.Slot : "div";

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
        onPointerDownCapture={onPointerDownCapture}
        onFocusCapture={onFocusCapture}
        onBlurCapture={onBlurCapture}
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
    ...backdropProps
  } = props;

  const open = useStore((state) => state.open);
  const maskPath = useStore((state) => state.maskPath);

  if (!open && !forceMount) return null;

  const SpotlightPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SpotlightPrimitive
      data-slot="tour-spotlight"
      data-state={getDataState(open)}
      {...backdropProps}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      style={{
        clipPath: maskPath,
        ...style,
      }}
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

  const RingPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RingPrimitive
      data-slot="tour-spotlight-ring"
      data-state={getDataState(open)}
      {...ringProps}
      className={cn(
        "pointer-events-none fixed z-50 border-ring ring-[3px] ring-ring/50",
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

function TourHeader(props: DivProps) {
  const { asChild, className, ...headerProps } = props;

  const context = useTourContext(HEADER_NAME);

  const HeaderPrimitive = asChild ? SlotPrimitive.Slot : "div";

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

  const TitlePrimitive = asChild ? SlotPrimitive.Slot : "div";

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

  const DescriptionPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <DescriptionPrimitive
      data-slot="tour-description"
      dir={context.dir}
      {...descriptionProps}
      className={cn("text-muted-foreground text-sm", className)}
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

  const ClosePrimitive = asChild ? SlotPrimitive.Slot : "button";

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

  const StepCounterPrimitive = asChild ? SlotPrimitive.Slot : "div";

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

function TourFooter(props: DivProps) {
  const { asChild, className, ref, ...footerProps } = props;

  const stepContext = useStepContext(FOOTER_NAME);
  const hasDefaultFooter = React.useContext(DefaultFooterContext);
  const context = useTourContext(FOOTER_NAME);

  const composedRef = useComposedRefs(
    ref,
    hasDefaultFooter ? undefined : stepContext.onFooterChange,
  );

  const FooterPrimitive = asChild ? SlotPrimitive.Slot : "div";

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

export {
  Tour,
  TourPortal,
  TourSpotlight,
  TourSpotlightRing,
  TourStep,
  TourArrow,
  TourHeader,
  TourTitle,
  TourDescription,
  TourClose,
  TourPrev,
  TourNext,
  TourSkip,
  TourStepCounter,
  TourFooter,
  //
  type TourProps,
};
