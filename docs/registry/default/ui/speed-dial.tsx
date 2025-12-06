"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROOT_NAME = "SpeedDial";
const TRIGGER_NAME = "SpeedDialTrigger";
const ACTION_NAME = "SpeedDialAction";

type Side = "up" | "down" | "left" | "right";

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

interface SpeedDialProps extends React.ComponentProps<"div"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
}

function SpeedDial({
  open: openProp,
  defaultOpen,
  onOpenChange,
  side = "up",
  className,
  ...props
}: SpeedDialProps) {
  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    open: openProp ?? defaultOpen ?? false,
    side,
  }));
  const propsRef = useAsRef({ onOpenChange });

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
  }, [openProp, store]);

  useIsomorphicLayoutEffect(() => {
    store.setState("side", side);
  }, [side]);

  return (
    <StoreContext.Provider value={store}>
      <div className={cn("relative", className)} {...props} />
    </StoreContext.Provider>
  );
}

interface SpeedDialTriggerProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode;
  closeIcon?: React.ReactNode;
}

function SpeedDialTrigger({
  icon,
  closeIcon = <X className="size-4" />,
  onClick,
  children,
  className,
  ...props
}: SpeedDialTriggerProps) {
  const store = useStoreContext(TRIGGER_NAME);
  const open = useStore((state) => state.open);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        store.setState("open", !open);
      }
    },
    [onClick, store, open],
  );

  return (
    <Button
      size="icon"
      className={cn(
        "size-14 rounded-full shadow-lg transition-all hover:scale-110",
        className,
      )}
      onClick={handleClick}
      aria-expanded={open}
      {...props}
    >
      <span className="relative flex size-full items-center justify-center">
        <span
          className={cn(
            "absolute transition-all duration-200",
            open
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
        >
          {icon || children}
        </span>
        <span
          className={cn(
            "absolute transition-all duration-200",
            open
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        >
          {closeIcon}
        </span>
      </span>
    </Button>
  );
}

const speedDialContentVariants = cva("absolute flex", {
  variants: {
    side: {
      up: "bottom-full mb-4 flex-col-reverse",
      down: "top-full mt-4 flex-col",
      left: "right-full mr-4 flex-row-reverse",
      right: "left-full ml-4 flex-row",
    },
  },
  defaultVariants: {
    side: "up",
  },
});

const speedDialItemVariants = cva(
  "transition-all duration-200 [transition-delay:var(--speed-dial-delay)]",
  {
    variants: {
      side: {
        up: "",
        down: "",
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
        side: "up",
        open: false,
        className: "translate-y-4 scale-0 opacity-0",
      },
      {
        side: "down",
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
      side: "up",
      open: false,
    },
  },
);

interface SpeedDialItemProps extends React.ComponentProps<"div"> {
  side: Side;
  open: boolean;
  delay: number;
}

function SpeedDialItem({
  side,
  open,
  delay,
  style,
  ...props
}: SpeedDialItemProps) {
  return (
    <div
      className={speedDialItemVariants({ side, open })}
      style={
        {
          "--speed-dial-delay": `${delay}ms`,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

interface SpeedDialContentProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof speedDialContentVariants> {
  gap?: number;
}

function SpeedDialContent({
  gap = 8,
  className,
  style,
  children,
  ...props
}: SpeedDialContentProps) {
  const open = useStore((state) => state.open);
  const side = useStore((state) => state.side);

  return (
    <div
      className={cn(speedDialContentVariants({ side }), className)}
      style={{ gap: `${gap}px`, ...style }}
      aria-hidden={!open}
      {...props}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return child;

        const totalChildren = React.Children.count(children);
        const delay = open ? index * 50 : (totalChildren - index - 1) * 30;

        return (
          <SpeedDialItem side={side} open={open} delay={delay}>
            {child}
          </SpeedDialItem>
        );
      })}
    </div>
  );
}

interface SpeedDialActionProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode;
  label?: string;
  showLabel?: boolean;
}

function SpeedDialAction({
  icon,
  label,
  showLabel = false,
  onClick,
  children,
  className,
  ...props
}: SpeedDialActionProps) {
  const store = useStoreContext(ACTION_NAME);

  const handleClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        store.setState("open", false);
      }
    },
    [onClick, store],
  );

  return (
    <div className="relative flex items-center gap-2">
      {showLabel && label && (
        <span className="pointer-events-none whitespace-nowrap rounded-md bg-popover px-2 py-1 text-popover-foreground text-sm shadow-md">
          {label}
        </span>
      )}
      <Button
        size="icon"
        variant="outline"
        className={cn("size-12 rounded-full shadow-md", className)}
        onClick={handleClick}
        aria-label={label}
        {...props}
      >
        {icon || children}
      </Button>
    </div>
  );
}

export { SpeedDial, SpeedDialTrigger, SpeedDialContent, SpeedDialAction };
