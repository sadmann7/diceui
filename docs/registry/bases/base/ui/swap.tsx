"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { useControlled } from "@base-ui/utils/useControlled";
import { cn } from "cn";
import * as React from "react";

type RootElement = HTMLDivElement;

const ON_NAME = "SwapOn";
const OFF_NAME = "SwapOff";

function getDataState(swapped: boolean) {
  return swapped ? "on" : "off";
}

const SwapContext = React.createContext<boolean | null>(null);

function useSwapContext(consumerName: string) {
  const context = React.useContext(SwapContext);
  if (context === null) {
    throw new Error(`\`${consumerName}\` must be used within \`Swap\``);
  }
  return context;
}

function useSwap<T>(selector: (state: { swapped: boolean }) => T): T {
  const swapped = useSwapContext("useSwap");
  return selector({ swapped });
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

  const [swapped, setSwappedState] = useControlled({
    controlled: swappedProp,
    default: defaultSwapped ?? false,
    name: "Swap",
    state: "swapped",
  });

  const isClickMode = activationMode === "click";

  function setSwapped(nextSwapped: boolean) {
    if (nextSwapped === swapped) return;
    onSwappedChange?.(nextSwapped);
    setSwappedState(nextSwapped);
  }

  function onClick(event: React.MouseEvent<RootElement>) {
    onClickProp?.(event);
    if (event.defaultPrevented || !isClickMode || disabled) return;

    setSwapped(!swapped);
  }

  function onMouseEnter(event: React.MouseEvent<RootElement>) {
    onMouseEnterProp?.(event);
    if (event.defaultPrevented || activationMode !== "hover" || disabled)
      return;

    setSwapped(true);
  }

  function onMouseLeave(event: React.MouseEvent<RootElement>) {
    onMouseLeaveProp?.(event);
    if (event.defaultPrevented || activationMode !== "hover" || disabled)
      return;

    setSwapped(false);
  }

  function onKeyDown(event: React.KeyboardEvent<RootElement>) {
    onKeyDownProp?.(event);
    if (event.defaultPrevented || !isClickMode || disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setSwapped(!swapped);
    }
  }

  const element = useRender({
    defaultTagName: "div",
    props: {
      ...mergeProps<"div">(
        {
          role: isClickMode ? "button" : undefined,
          "aria-pressed": isClickMode ? swapped : undefined,
          "aria-disabled": disabled,
          tabIndex: isClickMode && !disabled ? 0 : undefined,
          className: cn("cn-swap", className),
        },
        rootProps,
      ),
      onClick,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
    },
    render,
    state: {
      slot: "swap",
      animation,
      state: getDataState(swapped),
      disabled: disabled,
    },
  });

  return <SwapContext.Provider value={swapped}>{element}</SwapContext.Provider>;
}

interface SwapOnProps
  extends React.ComponentProps<"div">, useRender.ComponentProps<"div"> {}

function SwapOn({ render, className, ...props }: SwapOnProps) {
  const swapped = useSwapContext(ON_NAME);

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
  const swapped = useSwapContext(OFF_NAME);

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

export { Swap, SwapOff, SwapOn, type SwapProps, useSwap };
