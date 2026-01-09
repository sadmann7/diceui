"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/default/hooks/use-as-ref";
import { useLazyRef } from "@/registry/default/hooks/use-lazy-ref";

const ROOT_NAME = "Swap";
const ON_NAME = "SwapOn";
const OFF_NAME = "SwapOff";

interface StoreState {
  swapped: boolean;
}

interface Store {
  subscribe: (callback: () => void) => () => void;
  getState: () => StoreState;
  setState: <K extends keyof StoreState>(key: K, value: StoreState[K]) => void;
  notify: () => void;
}

const StoreContext = React.createContext<Store | null>(null);

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

interface SwapContextValue {
  activationMode: "click" | "hover";
  disabled?: boolean;
}

const SwapContext = React.createContext<SwapContextValue | null>(null);

function useSwapContext(consumerName: string) {
  const context = React.useContext(SwapContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface SwapProps extends React.ComponentProps<"div"> {
  /**
   * Whether the swap is initially in the swapped state.
   * @default false
   */
  defaultSwapped?: boolean;
  /**
   * Whether the swap is in the swapped state (controlled).
   */
  swapped?: boolean;
  /**
   * Callback when the swapped state changes.
   */
  onSwappedChange?: (swapped: boolean) => void;
  /**
   * The activation mode for triggering the swap.
   * @default "click"
   */
  activationMode?: "click" | "hover";
  /**
   * Whether the swap is disabled.
   */
  disabled?: boolean;
  /**
   * Whether to render as a child component.
   */
  asChild?: boolean;
}

function Swap(props: SwapProps) {
  const {
    defaultSwapped = false,
    swapped: swappedProp,
    onSwappedChange,
    activationMode = "click",
    disabled,
    asChild,
    className,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onClick: onClickProp,
    ref,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    swapped: swappedProp ?? defaultSwapped,
  }));

  const propsRef = useAsRef({
    onSwappedChange,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onClick: onClickProp,
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

        if (key === "swapped" && typeof value === "boolean") {
          stateRef.current.swapped = value;
          propsRef.current.onSwappedChange?.(value);
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

  const swapped = useStore((state) => state.swapped, store);

  React.useEffect(() => {
    if (swappedProp !== undefined) {
      store.setState("swapped", swappedProp);
    }
  }, [swappedProp, store]);

  const onToggle = React.useCallback(() => {
    if (disabled) return;
    store.setState("swapped", !store.getState().swapped);
  }, [store, disabled]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || activationMode !== "click") return;
      onToggle();
    },
    [propsRef, activationMode, onToggle],
  );

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onMouseEnter?.(event);
      if (event.defaultPrevented || activationMode !== "hover" || disabled)
        return;
      store.setState("swapped", true);
    },
    [propsRef, activationMode, store, disabled],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onMouseLeave?.(event);
      if (event.defaultPrevented || activationMode !== "hover" || disabled)
        return;
      store.setState("swapped", false);
    },
    [propsRef, activationMode, store, disabled],
  );

  const contextValue = React.useMemo<SwapContextValue>(
    () => ({
      activationMode,
      disabled,
    }),
    [activationMode, disabled],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <SwapContext.Provider value={contextValue}>
        <RootPrimitive
          role={activationMode === "click" ? "button" : undefined}
          tabIndex={activationMode === "click" && !disabled ? 0 : undefined}
          aria-pressed={activationMode === "click" ? swapped : undefined}
          data-slot="swap"
          data-state={swapped ? "on" : "off"}
          data-disabled={disabled ? "" : undefined}
          {...rootProps}
          ref={ref}
          onClick={onClick}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={(event) => {
            rootProps.onKeyDown?.(event);
            if (
              event.defaultPrevented ||
              activationMode !== "click" ||
              disabled
            )
              return;
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onToggle();
            }
          }}
          className={cn(
            "relative inline-flex cursor-pointer select-none items-center justify-center data-disabled:cursor-not-allowed data-disabled:opacity-50",
            className,
          )}
        />
      </SwapContext.Provider>
    </StoreContext.Provider>
  );
}

interface SwapOnProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function SwapOn(props: SwapOnProps) {
  const { asChild, className, ref, ...onProps } = props;
  useSwapContext(ON_NAME);
  const swapped = useStore((state) => state.swapped);

  const OnPrimitive = asChild ? Slot : "span";

  return (
    <OnPrimitive
      data-slot="swap-on"
      data-state={swapped ? "on" : "off"}
      {...onProps}
      ref={ref}
      className={cn(
        "transition-opacity duration-200",
        swapped ? "opacity-100" : "absolute opacity-0",
        className,
      )}
    />
  );
}

interface SwapOffProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function SwapOff(props: SwapOffProps) {
  const { asChild, className, ref, ...offProps } = props;
  useSwapContext(OFF_NAME);
  const swapped = useStore((state) => state.swapped);

  const OffPrimitive = asChild ? Slot : "span";

  return (
    <OffPrimitive
      data-slot="swap-off"
      data-state={swapped ? "on" : "off"}
      {...offProps}
      ref={ref}
      className={cn(
        "transition-opacity duration-200",
        swapped ? "absolute opacity-0" : "opacity-100",
        className,
      )}
    />
  );
}

export {
  Swap,
  SwapOn,
  SwapOff,
  //
  useStore as useSwap,
  //
  type SwapProps,
  type SwapOnProps,
  type SwapOffProps,
};
