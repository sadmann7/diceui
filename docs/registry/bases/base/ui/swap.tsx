"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import { cn } from "@/lib/utils";
import { useAsRef } from "@/registry/bases/base/hooks/use-as-ref";
import { useIsomorphicLayoutEffect } from "@/registry/bases/base/hooks/use-isomorphic-layout-effect";
import { useLazyRef } from "@/registry/bases/base/hooks/use-lazy-ref";

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
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {
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

  const listenersRef = useLazyRef(() => new Set<() => void>());
  const stateRef = useLazyRef<StoreState>(() => ({
    swapped: swappedProp ?? defaultSwapped ?? false,
  }));

  const propsRef = useAsRef({
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

  useIsomorphicLayoutEffect(() => {
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
        className: cn(
          "relative inline-flex cursor-pointer select-none items-center justify-center data-disabled:cursor-not-allowed data-disabled:opacity-50",
          className,
        ),
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
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}

function SwapOn({ render, className, ...props }: SwapOnProps) {
  const swapped = useStore((state) => state.swapped);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "transition-all duration-300 data-[state=off]:absolute data-[state=off]:opacity-0 data-[state=on]:opacity-100 motion-reduce:transition-none",
          "[*[data-animation=rotate]_&]:data-[state=off]:rotate-180 [*[data-animation=rotate]_&]:data-[state=on]:rotate-0 motion-reduce:[*[data-animation=rotate]_&]:data-[state=off]:rotate-0",
          "[*[data-animation=flip]_&]:data-[state=off]:transform-[rotateY(180deg)] [*[data-animation=flip]_&]:data-[state=on]:transform-[rotateY(0deg)] motion-reduce:[*[data-animation=flip]_&]:data-[state=off]:transform-[rotateY(0deg)]",
          "[*[data-animation=scale]_&]:data-[state=off]:scale-0 [*[data-animation=scale]_&]:data-[state=on]:scale-100 motion-reduce:[*[data-animation=scale]_&]:data-[state=off]:scale-100",
          className,
        ),
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
  extends React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}

function SwapOff({ render, className, ...props }: SwapOffProps) {
  const swapped = useStore((state) => state.swapped);

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "transition-all duration-300 data-[state=on]:absolute data-[state=off]:opacity-100 data-[state=on]:opacity-0 motion-reduce:transition-none",
          "[*[data-animation=rotate]_&]:data-[state=off]:rotate-0 [*[data-animation=rotate]_&]:data-[state=on]:rotate-180 motion-reduce:[*[data-animation=rotate]_&]:data-[state=on]:rotate-0",
          "[*[data-animation=flip]_&]:data-[state=off]:transform-[rotateY(0deg)] [*[data-animation=flip]_&]:data-[state=on]:transform-[rotateY(180deg)] motion-reduce:[*[data-animation=flip]_&]:data-[state=on]:transform-[rotateY(0deg)]",
          "[*[data-animation=scale]_&]:data-[state=off]:scale-100 [*[data-animation=scale]_&]:data-[state=on]:scale-0 motion-reduce:[*[data-animation=scale]_&]:data-[state=on]:scale-100",
          className,
        ),
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

export {
  Swap,
  SwapOn,
  SwapOff,
  //
  useStore as useSwap,
  //
  type SwapProps,
};
