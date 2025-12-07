"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "SpeedDial";
const ROOT_IMPL_NAME = "SpeedDialImpl";
const TRIGGER_NAME = "SpeedDialTrigger";
const CONTENT_NAME = "SpeedDialContent";
const ITEM_NAME = "SpeedDialItem";
const ACTION_NAME = "SpeedDialAction";
const LABEL_NAME = "SpeedDialLabel";

const ACTION_SELECT = "speeddial.actionSelect";
const INTERACT_OUTSIDE = "speeddial.interactOutside";
const EVENT_OPTIONS = { bubbles: true, cancelable: true };

const DEFAULT_GAP = "0.5rem";
const DEFAULT_OFFSET = "0.5rem";
const DEFAULT_ITEM_DELAY = 50;

type Side = "top" | "right" | "bottom" | "left";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof SpeedDialRoot>;
type TriggerElement = React.ComponentRef<typeof SpeedDialTrigger>;
type ActionElement = React.ComponentRef<typeof SpeedDialAction>;

interface SpeedDialInteractOutsideEvent extends CustomEvent {
  detail: {
    originalEvent: PointerEvent;
  };
}

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

function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

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

interface SpeedDialRootProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: SpeedDialInteractOutsideEvent) => void;
  side?: Side;
}

function SpeedDialRoot(props: SpeedDialRootProps) {
  const { open, defaultOpen, onOpenChange, side = "top", ...rootProps } = props;

  const contentId = React.useId();
  const nodesRef = React.useRef<Map<string, NodeData>>(new Map());
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: open ?? defaultOpen ?? false,
  }));
  const onOpenChangeRef = useAsRef(onOpenChange);

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
          onOpenChangeRef.current?.(value);
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
  }, [listenersRef, stateRef, onOpenChangeRef]);

  useIsomorphicLayoutEffect(() => {
    if (open !== undefined) {
      store.setState("open", open);
    }
  }, [open, store]);

  const contextValue = React.useMemo<SpeedDialContextValue>(
    () => ({
      contentId,
      side,
      onNodeRegister,
      onNodeUnregister,
      getNodes,
    }),
    [contentId, side, onNodeRegister, onNodeUnregister, getNodes],
  );

  return (
    <StoreContext.Provider value={store}>
      <SpeedDialContext.Provider value={contextValue}>
        <SpeedDialRootImpl {...rootProps} open={open} />
      </SpeedDialContext.Provider>
    </StoreContext.Provider>
  );
}

function SpeedDialRootImpl(
  props: Omit<SpeedDialRootProps, "defaultOpen" | "onOpenChange">,
) {
  const {
    onPointerDownCapture: onPointerDownCaptureProp,
    onEscapeKeyDown,
    onInteractOutside,
    asChild,
    className,
    ref,
    ...rootProps
  } = props;

  const rootRef = React.useRef<RootElement>(null);
  const composedRefs = useComposedRefs(ref, rootRef);
  const store = useStoreContext(ROOT_IMPL_NAME);
  const { getNodes } = useSpeedDialContext(ROOT_IMPL_NAME);
  const open = useStore((state) => state.open);
  const propsRef = useAsRef({
    onEscapeKeyDown,
    onInteractOutside,
  });

  const ownerDocument = rootRef.current?.ownerDocument ?? globalThis?.document;

  const isPointerInsideReactTreeRef = React.useRef(false);

  const onPointerDownCapture = React.useCallback(
    (event: React.PointerEvent<RootElement>) => {
      onPointerDownCaptureProp?.(event);
      if (event.defaultPrevented) return;

      isPointerInsideReactTreeRef.current = true;
    },
    [onPointerDownCaptureProp],
  );

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
        const activeElement = ownerDocument.activeElement as HTMLElement;

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

        if (isOutside) {
          function onOutsideEventDispatch() {
            const interactEvent = new CustomEvent(INTERACT_OUTSIDE, {
              ...EVENT_OPTIONS,
              detail: { originalEvent: event },
            }) as SpeedDialInteractOutsideEvent;

            propsRef.current?.onInteractOutside?.(interactEvent);
            if (interactEvent.defaultPrevented) return;

            store.setState("open", false);
          }

          if (event.pointerType === "touch") {
            ownerDocument.removeEventListener("click", onClickRef.current);
            onClickRef.current = onOutsideEventDispatch;
            ownerDocument.addEventListener("click", onClickRef.current, {
              once: true,
            });
          } else {
            onOutsideEventDispatch();
          }
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
  }, [open, propsRef, ownerDocument, store]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RootPrimitive
      data-slot="speed-dial"
      {...rootProps}
      ref={composedRefs}
      className={cn("relative flex flex-col items-end", className)}
      onPointerDownCapture={onPointerDownCapture}
    />
  );
}

function SpeedDialTrigger(props: React.ComponentProps<typeof Button>) {
  const {
    onClick: onClickProp,
    className,
    disabled,
    id,
    ref,
    ...triggerProps
  } = props;

  const store = useStoreContext(TRIGGER_NAME);
  const { onNodeRegister, onNodeUnregister, contentId } =
    useSpeedDialContext(TRIGGER_NAME);
  const open = useStore((state) => state.open);

  const instanceId = React.useId();
  const triggerId = id ?? instanceId;
  const triggerRef = React.useRef<TriggerElement>(null);
  const composedRef = useComposedRefs(ref, triggerRef);

  useIsomorphicLayoutEffect(() => {
    onNodeRegister({
      id: triggerId,
      ref: triggerRef,
      disabled: !!disabled,
    });

    return () => {
      onNodeUnregister(triggerId);
    };
  }, [onNodeRegister, onNodeUnregister, triggerId, disabled]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", !open);
    },
    [onClickProp, store, open],
  );

  return (
    <Button
      type="button"
      role="button"
      id={triggerId}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={contentId}
      data-slot="speed-dial-trigger"
      data-state={open ? "open" : "closed"}
      size="icon"
      disabled={disabled}
      {...triggerProps}
      ref={composedRef}
      className={cn("size-11 rounded-full", className)}
      onClick={onClick}
    />
  );
}

const SpeedDialItemImplContext = React.createContext<number | null>(null);

function useSpeedDialItemImplContext() {
  return React.useContext(SpeedDialItemImplContext);
}

const speedDialContentVariants = cva(
  "absolute z-50 flex gap-[var(--speed-dial-gap)]",
  {
    variants: {
      side: {
        top: "right-0 bottom-full mb-[var(--speed-dial-offset)] flex-col-reverse items-end",
        bottom:
          "top-full right-0 mt-[var(--speed-dial-offset)] flex-col items-end",
        left: "right-full mr-[var(--speed-dial-offset)] flex-row-reverse items-center",
        right: "left-full ml-[var(--speed-dial-offset)] flex-row items-center",
      },
    },
    defaultVariants: {
      side: "top",
    },
  },
);

interface SpeedDialContentProps
  extends DivProps,
    VariantProps<typeof speedDialContentVariants> {}

function SpeedDialContent(props: SpeedDialContentProps) {
  const { asChild, className, style, children, ...contentProps } = props;

  const open = useStore((state) => state.open);
  const { contentId, side } = useSpeedDialContext(CONTENT_NAME);

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      id={contentId}
      role="menu"
      aria-orientation={
        side === "top" || side === "bottom" ? "vertical" : "horizontal"
      }
      data-slot="speed-dial-content"
      data-side={side}
      {...contentProps}
      className={cn(speedDialContentVariants({ side, className }))}
      style={
        {
          "--speed-dial-gap": DEFAULT_GAP,
          "--speed-dial-offset": DEFAULT_OFFSET,
          "--speed-dial-transform-origin": getTransformOrigin(side),
          ...style,
        } as React.CSSProperties
      }
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
    </ContentPrimitive>
  );
}

const speedDialItemVariants = cva(
  "flex items-center gap-2 transition-all duration-200 [transform-origin:var(--speed-dial-transform-origin)] [transition-delay:var(--speed-dial-delay)]",
  {
    variants: {
      side: {
        top: "justify-end",
        bottom: "justify-end",
        left: "flex-row-reverse justify-start",
        right: "justify-start",
      },
      open: {
        true: "translate-x-0 translate-y-0 scale-100 opacity-100",
        false: "",
      },
    },
    compoundVariants: [
      {
        side: "top",
        open: false,
        className: "translate-y-4 scale-0 opacity-0",
      },
      {
        side: "bottom",
        open: false,
        className: "-translate-y-4 scale-0 opacity-0",
      },
      {
        side: "left",
        open: false,
        className: "translate-x-4 scale-0 opacity-0",
      },
      {
        side: "right",
        open: false,
        className: "-translate-x-4 scale-0 opacity-0",
      },
    ],
    defaultVariants: {
      side: "top",
      open: false,
    },
  },
);

const SpeedDialItemContext = React.createContext<string | null>(null);

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
  const labelId = React.useId();

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <SpeedDialItemContext.Provider value={labelId}>
      <ItemPrimitive
        role="none"
        data-slot="speed-dial-item"
        data-state={open ? "open" : "closed"}
        {...itemProps}
        className={cn(speedDialItemVariants({ side, open, className }))}
        style={
          {
            "--speed-dial-delay": `${delay}ms`,
            "--speed-dial-transform-origin": getTransformOrigin(side),
            ...style,
          } as React.CSSProperties
        }
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

  const store = useStoreContext(ACTION_NAME);
  const { onNodeRegister, onNodeUnregister } = useSpeedDialContext(ACTION_NAME);
  const labelId = useSpeedDialItemContext(ACTION_NAME);

  const instanceId = React.useId();
  const actionId = id ?? instanceId;
  const actionRef = React.useRef<ActionElement>(null);
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

  const onActionSelect = React.useCallback(() => {
    const action = actionRef.current;
    if (!action) return;

    const actionSelectEvent = new CustomEvent(ACTION_SELECT, EVENT_OPTIONS);

    action.addEventListener(ACTION_SELECT, (event) => onSelect?.(event), {
      once: true,
    });

    action.dispatchEvent(actionSelectEvent);
    if (actionSelectEvent.defaultPrevented) return;

    store.setState("open", false);
  }, [onSelect, store]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ActionElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      if (onSelect) {
        onActionSelect();
      }
    },
    [onClickProp, onSelect, onActionSelect],
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
      className={cn("size-11 shrink-0 rounded-full shadow-md", className)}
      onClick={onClick}
    />
  );
}

function SpeedDialLabel({ asChild, className, ...props }: DivProps) {
  const labelId = useSpeedDialItemContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      id={labelId}
      data-slot="speed-dial-label"
      className={cn(
        "pointer-events-none whitespace-nowrap rounded-md bg-popover px-2 py-1 text-popover-foreground text-sm shadow-md",
        className,
      )}
      {...props}
    />
  );
}

export {
  SpeedDialRoot as Root,
  SpeedDialTrigger as Trigger,
  SpeedDialContent as Content,
  SpeedDialItem as Item,
  SpeedDialAction as Action,
  SpeedDialLabel as Label,
  //
  SpeedDialRoot as SpeedDial,
  SpeedDialTrigger,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialAction,
  SpeedDialLabel,
};
