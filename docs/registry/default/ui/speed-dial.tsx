"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/default/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/default/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/default/hooks/use-lazy-ref";

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

type Side = "top" | "right" | "bottom" | "left";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof SpeedDial>;
type ContentElement = React.ComponentRef<typeof SpeedDialContent>;
type TriggerElement = React.ComponentRef<typeof SpeedDialTrigger>;
type ActionElement = React.ComponentRef<typeof SpeedDialAction>;

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
  contentId: string;
  side: Side;
  onNodeRegister: (node: NodeData) => void;
  onNodeUnregister: (id: string) => void;
  getNodes: () => NodeData[];
  rootRef: React.RefObject<RootElement | null>;
  isPointerInsideReactTreeRef: React.RefObject<boolean>;
  disabled: boolean;
  hoverCloseTimerRef: React.RefObject<number | null>;
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
  disabled?: boolean;
}

function SpeedDial(props: SpeedDialProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    onPointerDownCapture: onPointerDownCaptureProp,
    side = "top",
    asChild,
    disabled = false,
    className,
    ref,
    ...rootProps
  } = props;

  const contentId = React.useId();

  const rootRef = React.useRef<RootElement | null>(null);
  const composedRefs = useComposedRefs(ref, rootRef);

  const nodesRef = React.useRef<Map<string, NodeData>>(new Map());
  const isPointerInsideReactTreeRef = React.useRef(false);
  const hoverCloseTimerRef = React.useRef<number | null>(null);

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
  }));
  const propsRef = useAsRef({
    onOpenChange,
  });

  const onNodeRegister = React.useCallback((node: NodeData) => {
    nodesRef.current.set(node.id, node);
  }, []);

  const onNodeUnregister = React.useCallback((id: string) => {
    nodesRef.current.delete(id);
  }, []);

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

  useIsomorphicLayoutEffect(() => {
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp]);

  const open = useStore((state) => state.open, store);

  const onPointerDownCapture = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerDownCaptureProp?.(event);
      if (event.defaultPrevented) return;

      const target = event.target as HTMLElement;
      const nodes = getNodes();
      const isInteractiveElement = nodes.some((node) =>
        node.ref.current?.contains(target),
      );

      isPointerInsideReactTreeRef.current = isInteractiveElement;
    },
    [onPointerDownCaptureProp, getNodes],
  );

  const contextValue = React.useMemo<SpeedDialContextValue>(
    () => ({
      contentId,
      side,
      onNodeRegister,
      onNodeUnregister,
      getNodes,
      rootRef,
      isPointerInsideReactTreeRef,
      disabled,
      hoverCloseTimerRef,
    }),
    [contentId, side, onNodeRegister, onNodeUnregister, getNodes, disabled],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <SpeedDialContext.Provider value={contextValue}>
        <RootPrimitive
          data-slot="speed-dial"
          data-state={getDataState(open)}
          data-disabled={disabled}
          {...rootProps}
          ref={composedRefs}
          className={cn("relative flex flex-col items-end", className)}
          onPointerDownCapture={onPointerDownCapture}
        />
      </SpeedDialContext.Provider>
    </StoreContext.Provider>
  );
}

interface SpeedDialTriggerProps extends React.ComponentProps<typeof Button> {
  openOnHover?: boolean;
  delay?: number;
}

function SpeedDialTrigger(props: SpeedDialTriggerProps) {
  const {
    openOnHover = false,
    delay = 250,
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
    disabled,
    hoverCloseTimerRef,
  } = useSpeedDialContext(TRIGGER_NAME);

  const open = useStore((state) => state.open);
  const isDisabled = disabledProp || disabled;

  const instanceId = React.useId();
  const triggerId = id ?? instanceId;

  const triggerRef = React.useRef<TriggerElement | null>(null);
  const composedRef = useComposedRefs(ref, triggerRef);
  const hoverOpenTimerRef = React.useRef<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    onNodeRegister({
      id: triggerId,
      ref: triggerRef,
      disabled: isDisabled,
    });

    return () => {
      onNodeUnregister(triggerId);
    };
  }, [onNodeRegister, onNodeUnregister, triggerId, disabled]);

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

      // Clear all hover timers when clicking
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
      if (event.defaultPrevented || !openOnHover || isDisabled) return;

      // Cancel any pending close timer
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }

      // Cancel any pending open timer
      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
      }

      // Set new open timer
      hoverOpenTimerRef.current = window.setTimeout(() => {
        store.setState("open", true);
      }, delay);
    },
    [
      onMouseEnterProp,
      openOnHover,
      isDisabled,
      store,
      delay,
      hoverCloseTimerRef,
    ],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented || !openOnHover || isDisabled) return;

      // Cancel pending open timer
      if (hoverOpenTimerRef.current) {
        window.clearTimeout(hoverOpenTimerRef.current);
        hoverOpenTimerRef.current = null;
      }

      // Add delay before closing to allow moving to content
      hoverCloseTimerRef.current = window.setTimeout(() => {
        store.setState("open", false);
      }, 100);
    },
    [onMouseLeaveProp, openOnHover, isDisabled, store, hoverCloseTimerRef],
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
      className={cn("size-11 rounded-full", className)}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  );
}

const SpeedDialItemImplContext = React.createContext<number | null>(null);

function useSpeedDialItemImplContext() {
  return React.useContext(SpeedDialItemImplContext);
}

const speedDialContentVariants = cva(
  "fixed z-50 flex gap-[var(--speed-dial-gap)] data-[state=closed]:pointer-events-none",
  {
    variants: {
      side: {
        top: "flex-col-reverse items-end",
        bottom: "flex-col items-end",
        left: "flex-row-reverse items-center",
        right: "flex-row items-center",
      },
    },
    defaultVariants: {
      side: "top",
    },
  },
);

interface SpeedDialContentProps
  extends DivProps,
    VariantProps<typeof speedDialContentVariants> {
  offset?: number;
  gap?: number;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: InteractOutsideEvent) => void;
}

function SpeedDialContent(props: SpeedDialContentProps) {
  const {
    offset = DEFAULT_OFFSET,
    gap = DEFAULT_GAP,
    onEscapeKeyDown,
    onInteractOutside,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    asChild,
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
    isPointerInsideReactTreeRef,
    hoverCloseTimerRef,
  } = useSpeedDialContext(CONTENT_NAME);

  const contentRef = React.useRef<ContentElement | null>(null);
  const composedRef = useComposedRefs(ref, contentRef);

  const propsRef = useAsRef({
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

  const [mounted, setMounted] = React.useState(false);
  const [position, setPosition] = React.useState<React.CSSProperties>({});

  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = React.useCallback(() => {
    if (!rootRef.current || !open) return;

    const rootRect = rootRef.current.getBoundingClientRect();

    const newPosition: React.CSSProperties = {};

    switch (side) {
      case "top":
        newPosition.bottom = `${window.innerHeight - rootRect.top + offset}px`;
        newPosition.right = `${window.innerWidth - rootRect.right}px`;
        break;
      case "bottom":
        newPosition.top = `${rootRect.bottom + offset}px`;
        newPosition.right = `${window.innerWidth - rootRect.right}px`;
        break;
      case "left":
        newPosition.right = `${window.innerWidth - rootRect.left + offset}px`;
        newPosition.top = `${rootRect.top}px`;
        break;
      case "right":
        newPosition.left = `${rootRect.right + offset}px`;
        newPosition.top = `${rootRect.top}px`;
        break;
    }

    setPosition((prev) => {
      const hasChanged = Object.keys(newPosition).some((key) => {
        const k = key as keyof typeof newPosition;
        return prev[k] !== newPosition[k];
      });
      return hasChanged ? newPosition : prev;
    });
  }, [rootRef, open, side, offset]);

  const schedulePositionUpdate = React.useCallback(() => {
    if (rafRef.current) return;

    rafRef.current = requestAnimationFrame(() => {
      updatePosition();
      rafRef.current = null;
    });
  }, [updatePosition]);

  useIsomorphicLayoutEffect(() => {
    if (!open) return;

    updatePosition();

    window.addEventListener("resize", schedulePositionUpdate);
    window.addEventListener("scroll", schedulePositionUpdate, {
      capture: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("resize", schedulePositionUpdate);
      window.removeEventListener("scroll", schedulePositionUpdate, true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [open, updatePosition, schedulePositionUpdate]);

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
      if (event.defaultPrevented) return;

      // Cancel any pending close timer when hovering over content
      if (hoverCloseTimerRef.current) {
        window.clearTimeout(hoverCloseTimerRef.current);
        hoverCloseTimerRef.current = null;
      }
    },
    [propsRef, hoverCloseTimerRef],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<ContentElement>) => {
      propsRef.current?.onMouseLeave?.(event);
      if (event.defaultPrevented) return;

      // Set close timer when leaving content
      hoverCloseTimerRef.current = window.setTimeout(() => {
        store.setState("open", false);
      }, 100);
    },
    [propsRef, hoverCloseTimerRef, store],
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

  const ContentPrimitive = asChild ? Slot : "div";

  if (!mounted) return null;

  return ReactDOM.createPortal(
    <ContentPrimitive
      id={contentId}
      role="menu"
      aria-orientation={orientation}
      data-slot="speed-dial-content"
      data-state={getDataState(open)}
      data-orientation={orientation}
      data-side={side}
      {...contentProps}
      ref={composedRef}
      className={cn(speedDialContentVariants({ side, className }))}
      style={contentStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const totalChildren = React.Children.count(children);
        const delay = open
          ? index * DEFAULT_ITEM_DELAY
          : (totalChildren - index - 1) * DEFAULT_ITEM_DELAY;

        return (
          <SpeedDialItemImplContext.Provider value={delay}>
            {child}
          </SpeedDialItemImplContext.Provider>
        );
      })}
    </ContentPrimitive>,
    document.body,
  );
}

const speedDialItemVariants = cva(
  "flex items-center gap-2 transition-all duration-200 [transition-delay:var(--speed-dial-delay)] data-[state=open]:translate-x-0 data-[state=open]:translate-y-0 data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
  {
    variants: {
      side: {
        top: "justify-end",
        bottom: "justify-end",
        left: "flex-row-reverse justify-start",
        right: "justify-start",
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
  },
);

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
  const { asChild, className, style, children, ...itemProps } = props;

  const open = useStore((state) => state.open);
  const { side } = useSpeedDialContext(ITEM_NAME);
  const delay = useSpeedDialItemImplContext() ?? 0;

  const actionId = React.useId();
  const labelId = React.useId();

  const contextValue = React.useMemo<SpeedDialItemContextValue>(
    () => ({ actionId, labelId }),
    [actionId, labelId],
  );

  const itemStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--speed-dial-delay": `${delay}ms`,
      ...style,
    }),
    [delay, style],
  );

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <SpeedDialItemContext.Provider value={contextValue}>
      <ItemPrimitive
        role="none"
        data-slot="speed-dial-item"
        data-state={getDataState(open)}
        data-side={side}
        {...itemProps}
        className={cn(speedDialItemVariants({ side, className }))}
        style={itemStyle}
      >
        {children}
      </ItemPrimitive>
    </SpeedDialItemContext.Provider>
  );
}

interface SpeedDialActionProps
  extends Omit<React.ComponentProps<typeof Button>, "onSelect"> {
  onSelect?: (event: Event) => void;
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

  const propsRef = useAsRef({
    onClick: onClickProp,
    onSelect,
  });

  const store = useStoreContext(ACTION_NAME);

  const { onNodeRegister, onNodeUnregister } = useSpeedDialContext(ACTION_NAME);
  const { actionId: itemActionId, labelId } =
    useSpeedDialItemContext(ACTION_NAME);

  const actionId = id ?? itemActionId;

  const actionRef = React.useRef<ActionElement | null>(null);
  const composedRefs = useComposedRefs(ref, actionRef);

  useIsomorphicLayoutEffect(() => {
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
      className={cn(
        "size-11 shrink-0 rounded-full bg-accent shadow-md transition-transform duration-200 hover:scale-110 active:scale-95",
        className,
      )}
      onClick={onClick}
    />
  );
}

function SpeedDialLabel({ asChild, className, ...props }: DivProps) {
  const { labelId } = useSpeedDialItemContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      id={labelId}
      data-slot="speed-dial-label"
      {...props}
      className={cn(
        "pointer-events-none whitespace-nowrap rounded-md bg-popover px-2 py-1 text-popover-foreground text-sm shadow-md",
        className,
      )}
    />
  );
}

export {
  SpeedDial,
  SpeedDialTrigger,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialAction,
  SpeedDialLabel,
  //
  type SpeedDialProps,
};
