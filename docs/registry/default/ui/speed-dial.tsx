"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROOT_NAME = "SpeedDial";
const TRIGGER_NAME = "SpeedDialTrigger";
const ACTION_NAME = "SpeedDialAction";

type Side = "top" | "right" | "bottom" | "left";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

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
  side: Side;
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

interface SpeedDialProps extends DivProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
}

function SpeedDial(props: SpeedDialProps) {
  const {
    open: openProp,
    defaultOpen,
    onOpenChange,
    side = "top",
    asChild,
    className,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
    side,
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

  useIsomorphicLayoutEffect(() => {
    store.setState("side", side);
  }, [side]);

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <RootPrimitive
        data-slot="speed-dial"
        className={cn("relative flex flex-col items-end", className)}
        {...rootProps}
      />
    </StoreContext.Provider>
  );
}

interface SpeedDialTriggerProps
  extends Omit<React.ComponentProps<typeof Button>, "children"> {
  children?: React.ReactNode | ((props: { open: boolean }) => React.ReactNode);
}

function SpeedDialTrigger(props: SpeedDialTriggerProps) {
  const { onClick: onClickProp, className, children, ...triggerProps } = props;

  const store = useStoreContext(TRIGGER_NAME);
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
      aria-expanded={open}
      data-slot="speed-dial-trigger"
      data-state={open ? "open" : "closed"}
      size="icon"
      {...triggerProps}
      className={cn(
        "size-11 rounded-full shadow-lg [&_svg:not([class*='size-'])]:size-5",
        className,
      )}
      onClick={onClick}
    >
      {typeof children === "function" ? children({ open }) : children}
    </Button>
  );
}

const SpeedDialItemContext = React.createContext<number | null>(null);

function useSpeedDialItemContext() {
  return React.useContext(SpeedDialItemContext);
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
  const side = useStore((state) => state.side);

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <ContentPrimitive
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
          <SpeedDialItemContext.Provider value={delay}>
            {child}
          </SpeedDialItemContext.Provider>
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

function SpeedDialItem(props: DivProps) {
  const { asChild, className, style, ...itemProps } = props;

  const open = useStore((state) => state.open);
  const side = useStore((state) => state.side);
  const delay = useSpeedDialItemContext();

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      data-slot="speed-dial-item"
      {...itemProps}
      className={cn(speedDialItemVariants({ side, open, className }))}
      style={
        {
          "--speed-dial-delay": `${delay}ms`,
          ...style,
        } as React.CSSProperties
      }
    />
  );
}

function SpeedDialAction(props: React.ComponentProps<typeof Button>) {
  const { onClick: onClickProp, className, ...actionProps } = props;

  const store = useStoreContext(ACTION_NAME);

  const onClick = React.useCallback(
    (event: React.MouseEvent<ActionElement>) => {
      onClickProp?.(event);
      if (event.defaultPrevented) return;

      store.setState("open", false);
    },
    [onClickProp, store],
  );

  return (
    <Button
      type="button"
      data-slot="speed-dial-action"
      variant="outline"
      size="icon"
      {...actionProps}
      className={cn("size-11 shrink-0 rounded-full shadow-md", className)}
      onClick={onClick}
    />
  );
}

function SpeedDialLabel({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
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
