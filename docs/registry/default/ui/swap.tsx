"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/default/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/default/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/default/hooks/use-lazy-ref";

const ROOT_NAME = "Swap";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

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

interface SwapProps extends DivProps {
  swapped?: boolean;
  defaultSwapped?: boolean;
  onSwappedChange?: (swapped: boolean) => void;
  activationMode?: "click" | "hover";
  disabled?: boolean;
  asChild?: boolean;
}

function Swap(props: SwapProps) {
  const {
    swapped: swappedProp,
    defaultSwapped,
    onSwappedChange,
    activationMode = "click",
    disabled,
    asChild,
    className,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onClick: onClickProp,
    ...rootProps
  } = props;

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    swapped: swappedProp ?? defaultSwapped ?? false,
  }));

  const propsRef = useAsRef({
    disabled,
    onSwappedChange,
    onClick: onClickProp,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
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

  useIsomorphicLayoutEffect(() => {
    if (swappedProp !== undefined) {
      store.setState("swapped", swappedProp);
    }
  }, [swappedProp]);

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
      if (
        event.defaultPrevented ||
        activationMode !== "hover" ||
        propsRef.current.disabled
      )
        return;

      store.setState("swapped", true);
    },
    [propsRef, activationMode, store],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onMouseLeave?.(event);
      if (
        event.defaultPrevented ||
        activationMode !== "hover" ||
        propsRef.current.disabled
      )
        return;

      store.setState("swapped", false);
    },
    [propsRef, activationMode, store],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <RootPrimitive
        role={activationMode === "click" ? "button" : undefined}
        tabIndex={activationMode === "click" && !disabled ? 0 : undefined}
        aria-pressed={activationMode === "click" ? swapped : undefined}
        data-slot="swap"
        data-state={swapped ? "on" : "off"}
        data-disabled={disabled ? "" : undefined}
        {...rootProps}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={(event) => {
          rootProps.onKeyDown?.(event);
          if (event.defaultPrevented || activationMode !== "click" || disabled)
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
    </StoreContext.Provider>
  );
}

function SwapOn(props: DivProps) {
  const { asChild, className, ...onProps } = props;
  const swapped = useStore((state) => state.swapped);

  const OnPrimitive = asChild ? Slot : "div";

  return (
    <OnPrimitive
      data-slot="swap-on"
      data-state={swapped ? "on" : "off"}
      {...onProps}
      className={cn(
        "transition-opacity duration-200",
        swapped ? "opacity-100" : "absolute opacity-0",
        className,
      )}
    />
  );
}

function SwapOff(props: DivProps) {
  const { asChild, className, ...offProps } = props;
  const swapped = useStore((state) => state.swapped);

  const OffPrimitive = asChild ? Slot : "div";

  return (
    <OffPrimitive
      data-slot="swap-off"
      data-state={swapped ? "on" : "off"}
      {...offProps}
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
};
