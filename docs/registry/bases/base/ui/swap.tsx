"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import { useRefWithInit } from "@base-ui/utils/useRefWithInit";
import { useValueAsRef } from "@base-ui/utils/useValueAsRef";
import { cn } from "cn";
import * as React from "react";

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

interface SwapProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {
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
    render,
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

  useIsoLayoutEffect(() => {
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

  const element = useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        role: isClickMode ? "button" : undefined,
        "aria-pressed": isClickMode ? swapped : undefined,
        "aria-disabled": disabled,
        tabIndex: isClickMode && !disabled ? 0 : undefined,
        className: cn("cn-swap", className),
        onClick,
        onMouseEnter,
        onMouseLeave,
        onKeyDown,
      },
      rootProps,
    ),
    render,
    state: {
      slot: "swap",
      animation,
      state: getDataState(swapped),
      ...(disabled && { disabled: "" }),
    },
  });

  return <StoreContext.Provider value={store}>{element}</StoreContext.Provider>;
}

interface SwapOnProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function SwapOn({ render, className, ...props }: SwapOnProps) {
  const swapped = useStore((state) => state.swapped);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-swap-on", className),
      },
      props,
    ),
    render,
    state: {
      slot: "swap-on",
      state: getDataState(swapped),
    },
  });
}

interface SwapOffProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function SwapOff({ render, className, ...props }: SwapOffProps) {
  const swapped = useStore((state) => state.swapped);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn("cn-swap-off", className),
      },
      props,
    ),
    render,
    state: {
      slot: "swap-off",
      state: getDataState(swapped),
    },
  });
}

export { Swap, SwapOff, SwapOn, type SwapProps, useStore as useSwap };
