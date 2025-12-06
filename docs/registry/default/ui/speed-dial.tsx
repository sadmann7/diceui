"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "SpeedDial";
const TRIGGER_NAME = "SpeedDialTrigger";
const CONTENT_NAME = "SpeedDialContent";
const ITEM_NAME = "SpeedDialItem";
const ACTION_NAME = "SpeedDialAction";
const LABEL_NAME = "SpeedDialLabel";
const ACTION_SELECT = "speeddial.actionSelect";
const INTERACT_OUTSIDE = "speeddial.interactOutside";
const EVENT_OPTIONS = { bubbles: true, cancelable: true };

type Side = "top" | "right" | "bottom" | "left";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type RootElement = React.ComponentRef<typeof SpeedDial>;
type TriggerElement = React.ComponentRef<typeof SpeedDialTrigger>;
type ActionElement = React.ComponentRef<typeof SpeedDialAction>;

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

interface SpeedDialContextValue {
  contentId: string;
  side: Side;
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

interface SpeedDialInteractOutsideEvent extends CustomEvent {
  detail: {
    originalEvent: PointerEvent;
  };
}

interface SpeedDialProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: SpeedDialInteractOutsideEvent) => void;
}

function SpeedDial(props: SpeedDialProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    side = "top",
    ...rootProps
  } = props;

  const contentId = React.useId();
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
  }));
  const onOpenChangeRef = useAsRef(onOpenChange);

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
    if (openProp !== undefined) {
      store.setState("open", openProp);
    }
  }, [openProp, store]);

  const contextValue = React.useMemo<SpeedDialContextValue>(
    () => ({ contentId, side }),
    [contentId, side],
  );

  return (
    <StoreContext.Provider value={store}>
      <SpeedDialContext.Provider value={contextValue}>
        <SpeedDialImpl {...rootProps} />
      </SpeedDialContext.Provider>
    </StoreContext.Provider>
  );
}

function SpeedDialImpl(props: SpeedDialProps) {
  const {
    asChild,
    className,
    onPointerDownCapture: onPointerDownCaptureProp,
    onEscapeKeyDown,
    onInteractOutside,
    ref,
    ...rootProps
  } = props;

  const rootRef = React.useRef<RootElement>(null);
  const composedRefs = useComposedRefs(ref, rootRef);
  const store = useStoreContext("SpeedDialImpl");
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

        if (!event.defaultPrevented) {
          store.setState("open", false);
        }
      }
    };

    ownerDocument.addEventListener("keydown", onKeyDown);
    return () => ownerDocument.removeEventListener("keydown", onKeyDown);
  }, [open, propsRef, ownerDocument, store]);

  const onClickRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    if (!open) return;

    // Reset the ref when effect runs to avoid stale state from the opening click
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

            if (!interactEvent.defaultPrevented) {
              store.setState("open", false);
            }
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
  const { onClick: onClickProp, className, ...triggerProps } = props;

  const store = useStoreContext(TRIGGER_NAME);
  const { contentId } = useSpeedDialContext(TRIGGER_NAME);
  const open = useStore((state) => state.open);

  const onClick = React.useCallback(
    (event: React.MouseEvent<TriggerElement>) => {
      onClickProp?.(event);
      if (!event.defaultPrevented) {
        store.setState("open", !open);
      }
    },
    [onClickProp, store, open],
  );

  return (
    <Button
      type="button"
      role="button"
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={contentId}
      data-slot="speed-dial-trigger"
      data-state={open ? "open" : "closed"}
      size="icon"
      {...triggerProps}
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
  "absolute flex gap-[var(--speed-dial-gap)]",
  {
    variants: {
      side: {
        top: "bottom-full mb-[var(--speed-dial-offset)] flex-col-reverse",
        bottom: "top-full mt-[var(--speed-dial-offset)] flex-col",
        left: "right-full mr-[var(--speed-dial-offset)] flex-row-reverse",
        right: "left-full ml-[var(--speed-dial-offset)] flex-row",
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
  const speedDialContext = useSpeedDialContext(CONTENT_NAME);
  const side = speedDialContext.side;

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
      id={speedDialContext.contentId}
      role="menu"
      aria-orientation={
        side === "top" || side === "bottom" ? "vertical" : "horizontal"
      }
      data-slot="speed-dial-content"
      {...contentProps}
      className={cn(speedDialContentVariants({ side, className }))}
      style={
        {
          "--speed-dial-gap": "0.5rem",
          "--speed-dial-offset": "0.5rem",
          ...style,
        } as React.CSSProperties
      }
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const totalChildren = React.Children.count(children);
        const delay = open ? index * 50 : (totalChildren - index - 1) * 30;

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
  "flex items-center justify-end gap-2 transition-all duration-200 [transition-delay:var(--speed-dial-delay)]",
  {
    variants: {
      side: {
        top: "",
        bottom: "",
        left: "",
        right: "",
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
    throw new Error(
      `\`${consumerName}\` must be used within \`SpeedDialItem\``,
    );
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
        {...itemProps}
        className={cn(speedDialItemVariants({ side, open, className }))}
        style={
          {
            "--speed-dial-delay": `${delay}ms`,
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
    ref,
    ...actionProps
  } = props;

  const store = useStoreContext(ACTION_NAME);
  const labelId = useSpeedDialItemContext(ACTION_NAME);
  const actionRef = React.useRef<ActionElement>(null);
  const composedRefs = useComposedRefs(ref, actionRef);

  const onActionSelect = React.useCallback(() => {
    const action = actionRef.current;
    if (!action) return;

    const actionSelectEvent = new CustomEvent(ACTION_SELECT, EVENT_OPTIONS);

    action.addEventListener(ACTION_SELECT, (event) => onSelect?.(event), {
      once: true,
    });

    action.dispatchEvent(actionSelectEvent);

    if (!actionSelectEvent.defaultPrevented) {
      store.setState("open", false);
    }
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
      aria-labelledby={labelId}
      data-slot="speed-dial-action"
      variant="outline"
      size="icon"
      ref={composedRefs}
      {...actionProps}
      className={cn("size-11 shrink-0 rounded-full shadow-md", className)}
      onClick={onClick}
    />
  );
}

function SpeedDialLabel({ className, ...props }: React.ComponentProps<"span">) {
  const labelId = useSpeedDialItemContext(LABEL_NAME);

  return (
    <span
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
  SpeedDial,
  SpeedDialTrigger,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialAction,
  SpeedDialLabel,
};
