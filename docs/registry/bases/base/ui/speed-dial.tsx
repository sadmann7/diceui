"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { useRefWithInit } from "@base-ui/utils/useRefWithInit";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";

const ROOT_NAME = "SpeedDial";
const TRIGGER_NAME = "SpeedDialTrigger";
const CONTENT_NAME = "SpeedDialContent";
const ITEM_NAME = "SpeedDialItem";
const ACTION_NAME = "SpeedDialAction";
const LABEL_NAME = "SpeedDialLabel";

const ACTION_SELECT = "speedDial.actionSelect";
const INTERACT_OUTSIDE = "speedDial.interactOutside";
const EVENT_OPTIONS = { bubbles: true, cancelable: true };

const DEFAULT_GAP = 8;
const DEFAULT_OFFSET = 8;
const DEFAULT_ITEM_DELAY = 50;
const DEFAULT_HOVER_CLOSE_DELAY = 100;
const DEFAULT_ANIMATION_DURATION = 200;

type Side = "top" | "right" | "bottom" | "left";
type ActivationMode = "click" | "hover";

interface DivProps
  extends
    Omit<React.ComponentProps<"div">, "children">,
    useRender.ComponentProps<"div"> {}

type RootElement = HTMLDivElement;
type ContentElement = HTMLDivElement;
type TriggerElement = HTMLButtonElement;
type ActionElement = HTMLButtonElement;

interface InteractOutsideEvent extends CustomEvent {
  detail: {
    originalEvent: PointerEvent;
  };
}

function getDataState(open: boolean): string {
  return open ? "open" : "closed";
}

function getTransformOrigin(side: Side): string {
  switch (side) {
    case "top":
      return "bottom center";
    case "bottom":
      return "top center";
    case "left":
      return "right center";
    case "right":
      return "left center";
  }
}

interface StoreState {
  open: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
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

interface NodeData {
  id: string;
  ref: React.RefObject<HTMLElement | null>;
  disabled: boolean;
}

interface SpeedDialContextValue {
  onNodeRegister: (node: NodeData) => void;
  onNodeUnregister: (id: string) => void;
  getNodes: () => NodeData[];
  contentId: string;
  rootRef: React.RefObject<RootElement | null>;
  triggerRef: React.RefObject<TriggerElement | null>;
  isPointerInsideReactTreeRef: React.RefObject<boolean>;
  hoverCloseTimerRef: React.RefObject<number | null>;
  side: Side;
  activationMode: ActivationMode;
  delay: number;
  disabled: boolean;
}

const SpeedDialContext = React.createContext<SpeedDialContextValue | null>(
  null,
);

function useSpeedDialContext(consumerName: string) {
  const context = React.useContext(SpeedDialContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface SpeedDialProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  activationMode?: ActivationMode;
  delay?: number;
  disabled?: boolean;
}

function SpeedDial(props: SpeedDialProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    onPointerDownCapture: onPointerDownCaptureProp,
    side = "top",
    activationMode = "click",
    delay = 250,
    render,
    disabled = false,
    className,
    ref,
    ...rootProps
  } = props;

  const contentId = React.useId();

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRefs = useMergedRefs(ref, rootRef);

  const triggerRef = React.useRef<TriggerElement | null>(null);

  const nodesRef = React.useRef<Map<string, NodeData>>(new Map());
  const isPointerInsideReactTreeRef = React.useRef(false);
  const hoverCloseTimerRef = React.useRef<number | null>(null);

  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
  }));

  const propsRef = useValueAsRef({
    onOpenChange,
    onPointerDownCapture: onPointerDownCaptureProp,
  });

  const store = React.useMemo<Store>(() => {
    return {
      subscribe: (cb) => {
        listenersRef.current.add(cb);
        return () => listenersRef.current.delete(cb);
      },
      getState: () => stateRef.current,
      setState: (key, value) => {
        if (Object.is(stateRef.current[key], value)) return;

        if (key === "open" && typeof value === "boolean") {
          stateRef.current.open = value;
          propsRef.current.onOpenChange?.(value);
        } else {
          stateRef.current[key] = value;
        }

        store.notify();
      },
      notify: () => {
        for (const cb of listenersRef.current) {
          cb();
        }
      },
    };
  }, [listenersRef, stateRef, propsRef]);

  const getNodes = React.useCallback(() => {
    return Array.from(nodesRef.current.values())
      .filter((node) => node.ref.current)
      .sort((a, b) => {
        const elementA = a.ref.current;
        const elementB = b.ref.current;
        if (!elementA || !elementB) return 0;
        const position = elementA.compareDocumentPosition(elementB);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
          return -1;
        }
        if (position & Node.DOCUMENT_POSITION_PRECEDING) {
          return 1;
        }
        return 0;
      });
  }, []);

  const onNodeRegister = React.useCallback((node: NodeData) => {
    nodesRef.current.set(node.id, node);
  }, []);

  const onNodeUnregister = React.useCallback((id: string) => {
    nodesRef.current.delete(id);
  }, []);

  useIsoLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  const open = useStore((state) => state.open, store);

  const onPointerDownCapture = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      propsRef.current?.onPointerDownCapture?.(event);
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement;
      const nodes = getNodes();
      const isInteractiveElement = nodes.some((node) =>
        node.ref.current?.contains(target),
      );

      isPointerInsideReactTreeRef.current = isInteractiveElement;
    },
    [propsRef, getNodes],
  );

  const contextValue = React.useMemo<SpeedDialContextValue>(
    () => ({
      getNodes,
      onNodeRegister,
      onNodeUnregister,
      contentId,
      rootRef,
      triggerRef,
      isPointerInsideReactTreeRef,
      hoverCloseTimerRef,
      side,
      activationMode,
      delay,
      disabled,
    }),
    [
      getNodes,
      onNodeRegister,
      onNodeUnregister,
      contentId,
      side,
      activationMode,
      delay,
      disabled,
    ],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        ref: composedRefs,
        className: cn("cn-speed-dial", className),
        onPointerDownCapture,
      },
      rootProps,
    ),
    render,
    state: {
      slot: "speed-dial",
      state: getDataState(open),
      disabled,
    },
  });

  return (
    <StoreContext.Provider value={store}>
      <SpeedDialContext.Provider value={contextValue}>
        {element}
      </SpeedDialContext.Provider>
    </StoreContext.Provider>
  );
}

interface SpeedDialTriggerProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "onMouseEnter" | "onMouseLeave"
> {
  onClick?: (event: React.MouseEvent<TriggerElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<TriggerElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<TriggerElement>) => void;
}

function SpeedDialTrigger(props: SpeedDialTriggerProps) {
  const {
    onClick: onClickProp,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    className,
    disabled: disabledProp,
    id,
    ref,
    ...triggerProps
  } = props;

  const store = useStoreContext(TRIGGER_NAME);

  const {
    onNodeRegister,
    onNodeUnregister,
    contentId,
    hoverCloseTimerRef,
    triggerRef,
    activationMode,
    delay,
    disabled,
  } = useSpeedDialContext(TRIGGER_NAME);

  const open = useStore((state) => state.open);
  const isDisabled = disabledProp || disabled;

  const instanceId = React.useId();
  const triggerId = id ?? instanceId;

  const composedRef = useMergedRefs(ref, triggerRef);
  const hoverOpenTimerRef = React.useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    onNodeRegister({
      id: triggerId,
      ref: triggerRef,
      disabled: isDisabled,
    });

    return () => {
      onNodeUnregister(triggerId);
    };
  }, [onNodeRegister, onNodeUnregister, triggerId, isDisabled]);

  React.useEffect(() => {
    return () => {
      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
      }
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
      }
    };
  }, [hoverCloseTimerRef]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
        hoverOpenTimerRef.current = null;
      }
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }

      store.setState("open", !open);
    },
    [onClickProp, store, open, hoverCloseTimerRef],
  );

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onMouseEnterProp?.(event);
      if (event.defaultPrevented || activationMode !== "hover" || isDisabled)
        return;

      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }

      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
      }

      hoverOpenTimerRef.current = window.setTimeout(() => {
        store.setState("open", true);
      }, delay);
    },
    [
      onMouseEnterProp,
      activationMode,
      isDisabled,
      store,
      delay,
      hoverCloseTimerRef,
    ],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented || activationMode !== "hover" || isDisabled)
        return;

      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
        hoverOpenTimerRef.current = null;
      }

      hoverCloseTimerRef.current = window.setTimeout(() => {
        store.setState("open", false);
      }, DEFAULT_HOVER_CLOSE_DELAY);
    },
    [onMouseLeaveProp, activationMode, isDisabled, store, hoverCloseTimerRef],
  );

  return (
    <Button
      type="button"
      role="button"
      id={triggerId}
      aria-controls={contentId}
      aria-expanded={open}
      aria-haspopup="menu"
      data-slot="speed-dial-trigger"
      data-state={getDataState(open)}
      disabled={isDisabled}
      size="icon"
      {...triggerProps}
      ref={composedRef}
      className={cn("cn-speed-dial-trigger", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

interface SpeedDialItemImplContextValue {
  delay: number;
  open: boolean;
}

const SpeedDialItemImplContext =
  React.createContext<SpeedDialItemImplContextValue | null>(null);

function useSpeedDialItemImplContext() {
  return React.useContext(SpeedDialItemImplContext);
}

interface SpeedDialItemImplProps {
  delay: number;
  open: boolean;
  children: React.ReactNode;
}

const SpeedDialItemImpl = React.memo(function SpeedDialItemImpl({
  delay,
  open,
  children,
}: SpeedDialItemImplProps) {
  const contextValue = React.useMemo<SpeedDialItemImplContextValue>(
    () => ({ delay, open }),
    [delay, open],
  );

  return (
    <SpeedDialItemImplContext.Provider value={contextValue}>
      {children}
    </SpeedDialItemImplContext.Provider>
  );
});

const speedDialContentVariants = cva("cn-speed-dial-content", {
  variants: {
    side: {
      top: "cn-speed-dial-content-side-top",
      bottom: "cn-speed-dial-content-side-bottom",
      left: "cn-speed-dial-content-side-left",
      right: "cn-speed-dial-content-side-right",
    },
  },
  defaultVariants: {
    side: "top",
  },
});

interface SpeedDialContentProps
  extends DivProps, VariantProps<typeof speedDialContentVariants> {
  offset?: number;
  gap?: number;
  forceMount?: boolean;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
}

function SpeedDialContent(props: SpeedDialContentProps) {
  const {
    offset = DEFAULT_OFFSET,
    gap = DEFAULT_GAP,
    forceMount = false,
    onEscapeKeyDown,
    onInteractOutside,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    render,
    className,
    children,
    style,
    ref,
    ...contentProps
  } = props;

  const store = useStoreContext(CONTENT_NAME);
  const open = useStore((state) => state.open);

  const {
    contentId,
    side,
    getNodes,
    rootRef,
    triggerRef,
    isPointerInsideReactTreeRef,
    hoverCloseTimerRef,
    activationMode,
  } = useSpeedDialContext(CONTENT_NAME);

  const contentRef = React.useRef<ContentElement | null>(null);
  const composedRef = useMergedRefs(ref, contentRef);

  const propsRef = useValueAsRef({
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onEscapeKeyDown,
    onInteractOutside,
  });

  const orientation =
    side === "top" || side === "bottom" ? "vertical" : "horizontal";

  const transformOrigin = React.useMemo(() => getTransformOrigin(side), [side]);

  const ownerDocument =
    contentRef.current?.ownerDocument ?? globalThis?.document;

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [renderState, setRenderState] = React.useState({
    shouldRender: false,
    animating: false,
  });
  const [position, setPosition] = React.useState<React.CSSProperties>({});

  const openRafRef = React.useRef<number | null>(null);
  const unmountTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (open) {
      if (unmountTimerRef.current) {
        clearTimeout(unmountTimerRef.current);
        unmountTimerRef.current = null;
      }

      setRenderState((prev) => ({ ...prev, shouldRender: true }));

      if (openRafRef.current) cancelAnimationFrame(openRafRef.current);
      openRafRef.current = requestAnimationFrame(() => {
        setRenderState((prev) => ({ ...prev, animating: true }));
        openRafRef.current = null;
      });

      return () => {
        if (openRafRef.current) {
          cancelAnimationFrame(openRafRef.current);
          openRafRef.current = null;
        }
      };
    } else {
      setRenderState((prev) => ({ ...prev, animating: false }));

      if (!forceMount) {
        const childCount = React.Children.count(children);
        const animationDuration = DEFAULT_ANIMATION_DURATION;
        const longestDelay = (childCount - 1) * DEFAULT_ITEM_DELAY;
        const totalDuration = longestDelay + animationDuration;

        unmountTimerRef.current = window.setTimeout(() => {
          setRenderState((prev) => ({ ...prev, shouldRender: false }));
        }, totalDuration);

        return () => {
          if (unmountTimerRef.current) {
            clearTimeout(unmountTimerRef.current);
            unmountTimerRef.current = null;
          }
        };
      }
    }
  }, [open, forceMount, children]);

  const updatePosition = React.useCallback(() => {
    if (!triggerRef.current || !open) return;

    const newPosition: React.CSSProperties = {};

    switch (side) {
      case "top":
        newPosition.bottom = `calc(100% + ${offset}px)`;
        newPosition.right = "0";
        break;
      case "bottom":
        newPosition.top = `calc(100% + ${offset}px)`;
        newPosition.right = "0";
        break;
      case "left":
        newPosition.right = `calc(100% + ${offset}px)`;
        newPosition.top = "0";
        break;
      case "right":
        newPosition.left = `calc(100% + ${offset}px)`;
        newPosition.top = "0";
        break;
    }

    setPosition((prev) => {
      const hasChanged = Object.keys(newPosition).some((key) => {
        const k = key as keyof typeof newPosition;
        return prev[k] !== newPosition[k];
      });
      return hasChanged ? newPosition : prev;
    });
  }, [triggerRef, open, side, offset]);

  useIsoLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        propsRef.current?.onEscapeKeyDown?.(event);
        if (event.defaultPrevented) return;

        store.setState("open", false);
      }

      if (event.key === "Tab") {
        const focusableElements = getNodes()
          .filter((node) => !node.disabled)
          .map((node) => node.ref.current);

        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        const activeElement = ownerDocument.activeElement;

        if (event.shiftKey) {
          if (activeElement === firstElement) {
            store.setState("open", false);
          }
        } else {
          if (activeElement === lastElement) {
            store.setState("open", false);
          }
        }
      }
    };

    ownerDocument.addEventListener("keydown", onKeyDown);
    return () => ownerDocument.removeEventListener("keydown", onKeyDown);
  }, [open, propsRef, ownerDocument, store, getNodes]);

  const onClickRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    if (!open) return;

    isPointerInsideReactTreeRef.current = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.target && !isPointerInsideReactTreeRef.current) {
        const target = event.target as HTMLElement;
        const isOutside = !rootRef.current?.contains(target);

        function onDismiss() {
          if (isOutside) {
            const interactEvent = new CustomEvent(INTERACT_OUTSIDE, {
              ...EVENT_OPTIONS,
              detail: { originalEvent: event },
            }) as InteractOutsideEvent;

            propsRef.current?.onInteractOutside?.(interactEvent);
            if (interactEvent.defaultPrevented) return;
          }

          store.setState("open", false);
        }

        if (event.pointerType === "touch") {
          ownerDocument.removeEventListener("click", onClickRef.current);
          onClickRef.current = onDismiss;
          ownerDocument.addEventListener("click", onClickRef.current, {
            once: true,
          });
        } else {
          onDismiss();
        }
      } else {
        ownerDocument.removeEventListener("click", onClickRef.current);
      }
      isPointerInsideReactTreeRef.current = false;
    };

    const timerId = window.setTimeout(() => {
      ownerDocument.addEventListener("pointerdown", onPointerDown);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      ownerDocument.removeEventListener("pointerdown", onPointerDown);
      ownerDocument.removeEventListener("click", onClickRef.current);
    };
  }, [
    open,
    rootRef,
    isPointerInsideReactTreeRef,
    propsRef,
    ownerDocument,
    store,
  ]);

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<ContentElement>) => {
      propsRef.current?.onMouseEnter?.(event);
      if (event.defaultPrevented || activationMode !== "hover") return;

      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }
    },
    [propsRef, hoverCloseTimerRef, activationMode],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<ContentElement>) => {
      propsRef.current?.onMouseLeave?.(event);
      if (event.defaultPrevented || activationMode !== "hover") return;

      hoverCloseTimerRef.current = window.setTimeout(() => {
        store.setState("open", false);
      }, DEFAULT_HOVER_CLOSE_DELAY);
    },
    [propsRef, hoverCloseTimerRef, store, activationMode],
  );

  const contentStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--speed-dial-gap": `${gap}px`,
      "--speed-dial-offset": `${offset}px`,
      "--speed-dial-transform-origin": transformOrigin,
      ...position,
      ...style,
    }),
    [gap, offset, transformOrigin, position, style],
  );

  const processedChildren = React.useMemo(() => {
    const totalChildren = React.Children.count(children);
    return React.Children.map(children, (child, index) => {
      if (!React.isValidElement(child)) return child;

      const delay = renderState.animating
        ? index * DEFAULT_ITEM_DELAY
        : (totalChildren - index - 1) * DEFAULT_ITEM_DELAY;

      return (
        <SpeedDialItemImpl
          key={child.key ?? index}
          delay={delay}
          open={renderState.animating}
        >
          {child}
        </SpeedDialItemImpl>
      );
    });
  }, [children, renderState.animating]);

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id: contentId,
        role: "menu",
        "aria-orientation": orientation,
        ref: composedRef,
        className: cn(speedDialContentVariants({ side, className })),
        style: contentStyle,
        onMouseEnter,
        onMouseLeave,
        children: processedChildren,
      },
      contentProps,
    ),
    render,
    state: {
      slot: "speed-dial-content",
      state: getDataState(renderState.animating),
      orientation,
      side,
    },
  });

  const shouldMount = forceMount || renderState.shouldRender;

  if (!mounted || !shouldMount) return null;

  return element;
}

const speedDialItemVariants = cva("cn-speed-dial-item", {
  variants: {
    side: {
      top: "cn-speed-dial-item-side-top",
      bottom: "cn-speed-dial-item-side-bottom",
      left: "cn-speed-dial-item-side-left",
      right: "cn-speed-dial-item-side-right",
    },
  },
  compoundVariants: [
    {
      side: "top",
      className: "data-[state=closed]:translate-y-2",
    },
    {
      side: "bottom",
      className: "data-[state=closed]:-translate-y-2",
    },
    {
      side: "left",
      className: "data-[state=closed]:translate-x-2",
    },
    {
      side: "right",
      className: "data-[state=closed]:-translate-x-2",
    },
  ],
  defaultVariants: {
    side: "top",
  },
});

interface SpeedDialItemContextValue {
  actionId: string;
  labelId: string;
}

const SpeedDialItemContext =
  React.createContext<SpeedDialItemContextValue | null>(null);

function useSpeedDialItemContext(consumerName: string) {
  const context = React.useContext(SpeedDialItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

function SpeedDialItem(props: DivProps) {
  const { render, className, style, children, ...itemProps } = props;

  const { side } = useSpeedDialContext(ITEM_NAME);
  const itemImplContext = useSpeedDialItemImplContext();
  const delay = itemImplContext?.delay ?? 0;
  const open = itemImplContext?.open ?? false;

  const actionId = React.useId();
  const labelId = React.useId();

  const contextValue = React.useMemo<SpeedDialItemContextValue>(
    () => ({ actionId, labelId }),
    [actionId, labelId],
  );

  const itemStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--speed-dial-animation-duration": `${DEFAULT_ANIMATION_DURATION}ms`,
      "--speed-dial-delay": `${delay}ms`,
      ...style,
    }),
    [delay, style],
  );

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: "none",
        className: cn(speedDialItemVariants({ side, className })),
        style: itemStyle,
        children,
      },
      itemProps,
    ),
    render,
    state: {
      slot: "speed-dial-item",
      state: getDataState(open),
      side,
    },
  });

  return (
    <SpeedDialItemContext.Provider value={contextValue}>
      {element}
    </SpeedDialItemContext.Provider>
  );
}

interface SpeedDialActionProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onSelect" | "onClick"
> {
  onSelect?: (event: Event) => void;
  onClick?: (event: React.MouseEvent<ActionElement>) => void;
}

function SpeedDialAction(props: SpeedDialActionProps) {
  const {
    onSelect,
    onClick: onClickProp,
    className,
    disabled,
    id,
    ref,
    ...actionProps
  } = props;

  const propsRef = useValueAsRef({
    onClick: onClickProp,
    onSelect,
  });

  const store = useStoreContext(ACTION_NAME);

  const { onNodeRegister, onNodeUnregister } = useSpeedDialContext(ACTION_NAME);
  const { actionId: itemActionId, labelId } =
    useSpeedDialItemContext(ACTION_NAME);

  const actionId = id ?? itemActionId;

  const actionRef = React.useRef<ActionElement | null>(null);
  const composedRefs = useMergedRefs(ref, actionRef);

  useIsoLayoutEffect(() => {
    onNodeRegister({
      id: actionId,
      ref: actionRef,
      disabled: !!disabled,
    });

    return () => {
      onNodeUnregister(actionId);
    };
  }, [onNodeRegister, onNodeUnregister, actionId, disabled]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ActionElement>) => {
      propsRef.current?.onClick?.(event);
      if (event.defaultPrevented) return;

      const action = actionRef.current;
      if (!action) return;

      const actionSelectEvent = new CustomEvent(ACTION_SELECT, EVENT_OPTIONS);

      action.addEventListener(
        ACTION_SELECT,
        (event) => propsRef.current?.onSelect?.(event),
        {
          once: true,
        },
      );

      action.dispatchEvent(actionSelectEvent);
      if (actionSelectEvent.defaultPrevented) return;

      store.setState("open", false);
    },
    [propsRef, store],
  );

  return (
    <Button
      type="button"
      role="menuitem"
      id={actionId}
      aria-labelledby={labelId}
      data-slot="speed-dial-action"
      variant="outline"
      size="icon"
      disabled={disabled}
      ref={composedRefs}
      {...actionProps}
      className={cn("cn-speed-dial-action", className)}
      onClick={onClick}
    />
  );
}

function SpeedDialLabel({ render, className, ...props }: DivProps) {
  const { labelId } = useSpeedDialItemContext(LABEL_NAME);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        id: labelId,
        className: cn("cn-speed-dial-label", className),
      },
      props,
    ),
    render,
    state: {
      slot: "speed-dial-label",
    },
  });
}

export {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  type SpeedDialProps,
  SpeedDialTrigger,
};
