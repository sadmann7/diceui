"use client";

import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
import { useLayoutEffect } from "radix-ui/internal";
import * as React from "react";

import { useRefWithInit } from "@/registry/bases/radix/hooks/use-ref-with-init";
import { useValueAsRef } from "@/registry/bases/radix/hooks/use-value-as-ref";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function getDataState(swapped: boolean) {
  return swapped ? "on" : "off";
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
    throw new Error(`\`useStore\` must be used within \`Swap\``);
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
  animation?: "fade" | "rotate" | "flip" | "scale";
  disabled?: boolean;
}

function Swap(props: SwapProps) {
  const {
    swapped: swappedProp,
    defaultSwapped,
    onSwappedChange,
    activationMode = "click",
    animation = "fade",
    disabled,
    asChild,
    className,
    onClick: onClickProp,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onKeyDown: onKeyDownProp,
    ...rootProps
  } = props;

  const listenersRef = useRefWithInit(() => new Set<() => void>());
  const stateRef = useRefWithInit<StoreState>(() => ({
    swapped: swappedProp ?? defaultSwapped ?? false,
  }));

  const propsRef = useValueAsRef({
    activationMode,
    animation,
    disabled,
    onSwappedChange,
    onClick: onClickProp,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onKeyDown: onKeyDownProp,
  });

  const isClickMode = activationMode === "click";

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

  useLayoutEffect(() => {
    if (swappedProp !== undefined) {
      store.setState("swapped", swappedProp);
    }
  }, [swappedProp]);

  const onToggle = React.useCallback(() => {
    if (propsRef.current.disabled) return;

    store.setState("swapped", !store.getState().swapped);
  }, [store, propsRef]);

  const onClick = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      propsRef.current.onClick?.(event);
      if (event.defaultPrevented || propsRef.current.activationMode !== "click")
        return;

      onToggle();
    },
    [propsRef, onToggle],
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

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      propsRef.current.onKeyDown?.(event);
      if (
        event.defaultPrevented ||
        propsRef.current.activationMode !== "click" ||
        propsRef.current.disabled
      )
        return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle();
      }
    },
    [propsRef, onToggle],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <RootPrimitive
        role={isClickMode ? "button" : undefined}
        aria-pressed={isClickMode ? swapped : undefined}
        aria-disabled={disabled}
        data-slot="swap"
        data-animation={animation}
        data-state={getDataState(swapped)}
        data-disabled={disabled ? "" : undefined}
        tabIndex={isClickMode && !disabled ? 0 : undefined}
        {...rootProps}
        className={cn("cn-swap", className)}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onKeyDown={onKeyDown}
      />
    </StoreContext.Provider>
  );
}

function SwapOn(props: DivProps) {
  const { asChild, className, ...onProps } = props;

  const swapped = useStore((state) => state.swapped);

  const OnPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OnPrimitive
      data-slot="swap-on"
      data-state={getDataState(swapped)}
      {...onProps}
      className={cn("cn-swap-on", className)}
    />
  );
}

function SwapOff(props: DivProps) {
  const { asChild, className, ...offProps } = props;

  const swapped = useStore((state) => state.swapped);

  const OffPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OffPrimitive
      data-slot="swap-off"
      data-state={getDataState(swapped)}
      {...offProps}
      className={cn("cn-swap-off", className)}
    />
  );
}

export { Swap, SwapOff, SwapOn, type SwapProps, useStore as useSwap };
