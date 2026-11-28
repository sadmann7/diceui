"use client";

import { useControlled } from "@base-ui/utils/useControlled";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";
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

interface SwapProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
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

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <SwapContext.Provider value={swapped}>
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
    </SwapContext.Provider>
  );
}

interface SwapOnProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function SwapOn({ asChild, className, ...props }: SwapOnProps) {
  const swapped = useSwapContext(ON_NAME);

  const OnPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OnPrimitive
      data-slot="swap-on"
      data-state={getDataState(swapped)}
      {...props}
      className={cn("cn-swap-on", className)}
    />
  );
}

interface SwapOffProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function SwapOff({ asChild, className, ...props }: SwapOffProps) {
  const swapped = useSwapContext(OFF_NAME);

  const OffPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <OffPrimitive
      data-slot="swap-off"
      data-state={getDataState(swapped)}
      {...props}
      className={cn("cn-swap-off", className)}
    />
  );
}

export { Swap, SwapOff, SwapOn, type SwapProps, useSwap };
