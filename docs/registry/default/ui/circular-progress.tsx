"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const CIRCULAR_PROGRESS_NAME = "CircularProgress";
const INDICATOR_NAME = "CircularProgressIndicator";
const TRACK_NAME = "CircularProgressTrack";
const RANGE_NAME = "CircularProgressRange";
const LABEL_NAME = "CircularProgressLabel";
const VALUE_TEXT_NAME = "CircularProgressValueText";

const DEFAULT_MAX = 100;

type ProgressState = "indeterminate" | "complete" | "loading";

interface CircularProgressContextValue {
  value: number | null;
  onValueChange?(value: number | null): void;
  max: number;
  min: number;
  valueLabel: string | undefined;
  state: ProgressState;
  radius: number;
  trackWidth: number;
  size: number;
}

const CircularProgressContext =
  React.createContext<CircularProgressContextValue | null>(null);

function useCircularProgressContext(consumerName: string) {
  const context = React.useContext(CircularProgressContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${CIRCULAR_PROGRESS_NAME}\``,
    );
  }
  return context;
}

interface CircularProgressRootProps extends React.ComponentProps<"div"> {
  value?: number | null | undefined;
  onValueChange?(value: number | null): void;
  getValueLabel?(value: number, max: number): string;
  max?: number;
  min?: number;
  size?: number;
  trackWidth?: number;
  asChild?: boolean;
}

function getProgressState(
  value: number | undefined | null,
  maxValue: number,
): ProgressState {
  return value == null
    ? "indeterminate"
    : value === maxValue
      ? "complete"
      : "loading";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isValidMaxNumber(max: unknown): max is number {
  return isNumber(max) && !Number.isNaN(max) && max > 0;
}

function isValidValueNumber(
  value: unknown,
  max: number,
  min: number,
): value is number {
  return (
    isNumber(value) && !Number.isNaN(value) && value <= max && value >= min
  );
}

function defaultGetValueLabel(value: number, max: number) {
  return `${Math.round((value / max) * 100)}%`;
}

function getInvalidMaxError(propValue: string, componentName: string) {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid max values. Defaulting to \`${DEFAULT_MAX}\`.`;
}

function getInvalidValueError(propValue: string, componentName: string) {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be:
  - a positive number
  - less than the value passed to \`max\` (or ${DEFAULT_MAX} if no \`max\` prop is set)
  - greater than or equal to the value passed to \`min\`
  - \`null\` or \`undefined\` if the progress is indeterminate.

The value will be clamped to the valid range or set to null if invalid.`;
}

function CircularProgressRoot(props: CircularProgressRootProps) {
  const {
    value: valueProp = null,
    max: maxProp,
    min: minProp = 0,
    size = 48,
    trackWidth = 4,
    onValueChange,
    getValueLabel = defaultGetValueLabel,
    asChild,
    className,
    ...progressProps
  } = props;

  if ((maxProp || maxProp === 0) && !isValidMaxNumber(maxProp)) {
    console.error(getInvalidMaxError(`${maxProp}`, CIRCULAR_PROGRESS_NAME));
  }

  const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
  const min = isNumber(minProp) ? minProp : 0;

  if (valueProp !== null && !isValidValueNumber(valueProp, max, min)) {
    console.error(getInvalidValueError(`${valueProp}`, CIRCULAR_PROGRESS_NAME));
  }

  const value = isValidValueNumber(valueProp, max, min)
    ? valueProp
    : isNumber(valueProp) && valueProp > max
      ? max
      : isNumber(valueProp) && valueProp < min
        ? min
        : null;
  const valueLabel = isNumber(value) ? getValueLabel(value, max) : undefined;
  const state = getProgressState(value, max);
  const radius = (size - trackWidth) / 2;

  const contextValue = React.useMemo<CircularProgressContextValue>(
    () => ({
      value,
      onValueChange,
      valueLabel,
      max,
      min,
      state,
      radius,
      trackWidth,
      size,
    }),
    [
      value,
      onValueChange,
      valueLabel,
      max,
      min,
      state,
      radius,
      trackWidth,
      size,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <CircularProgressContext.Provider value={contextValue}>
      <RootPrimitive
        role="progressbar"
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={isNumber(value) ? value : undefined}
        aria-valuetext={valueLabel}
        data-state={state}
        data-value={value ?? undefined}
        data-max={max}
        data-min={min}
        {...progressProps}
        className={cn(
          "relative inline-flex items-center justify-center",
          className,
        )}
      />
    </CircularProgressContext.Provider>
  );
}

function CircularProgressIndicator(props: React.ComponentProps<"svg">) {
  const { className, ...indicatorProps } = props;
  const context = useCircularProgressContext(INDICATOR_NAME);

  return (
    <svg
      width={context.size}
      height={context.size}
      viewBox={`0 0 ${context.size} ${context.size}`}
      data-state={context.state}
      data-value={context.value ?? undefined}
      data-max={context.max}
      data-min={context.min}
      {...indicatorProps}
      className={cn("-rotate-90 transform", className)}
    />
  );
}

function CircularProgressTrack(props: React.ComponentProps<"circle">) {
  const { className, ...trackProps } = props;
  const context = useCircularProgressContext(TRACK_NAME);

  const center = context.size / 2;

  return (
    <circle
      cx={center}
      cy={center}
      r={context.radius}
      fill="none"
      stroke="currentColor"
      strokeWidth={context.trackWidth}
      data-state={context.state}
      {...trackProps}
      className={cn("text-muted-foreground/20", className)}
    />
  );
}

function CircularProgressRange(props: React.ComponentProps<"circle">) {
  const { className, ...rangeProps } = props;
  const context = useCircularProgressContext(RANGE_NAME);

  const center = context.size / 2;
  const circumference = 2 * Math.PI * context.radius;

  let strokeDasharray = circumference;
  let strokeDashoffset = circumference;

  if (context.state === "indeterminate") {
    // For indeterminate, show 25% of the circle as an arc
    strokeDasharray = circumference;
    strokeDashoffset = circumference * 0.75; // Show 25% (hide 75%)
  } else if (context.value !== null) {
    const normalizedValue =
      ((context.value - context.min) / (context.max - context.min)) * 100;
    const progress = (normalizedValue / 100) * circumference;
    strokeDashoffset = circumference - progress;
  }

  return (
    <circle
      cx={center}
      cy={center}
      r={context.radius}
      fill="none"
      stroke="currentColor"
      strokeWidth={context.trackWidth}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      data-state={context.state}
      data-value={context.value ?? undefined}
      data-max={context.max}
      data-min={context.min}
      {...rangeProps}
      className={cn(
        "text-primary transition-all duration-300 ease-in-out",
        context.state === "indeterminate" &&
          "[animation:var(--animate-spin-around)]",
        className,
      )}
      style={{
        ...rangeProps.style,
        transformOrigin: "center",
      }}
    />
  );
}

interface CircularProgressLabelProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function CircularProgressLabel(props: CircularProgressLabelProps) {
  const { asChild, className, ...labelProps } = props;
  const context = useCircularProgressContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "span";

  return (
    <LabelPrimitive
      data-state={context.state}
      {...labelProps}
      className={cn(
        "absolute inset-0 flex items-center justify-center font-medium text-sm",
        className,
      )}
    />
  );
}

interface CircularProgressValueTextProps extends React.ComponentProps<"span"> {
  asChild?: boolean;
}

function CircularProgressValueText(props: CircularProgressValueTextProps) {
  const { asChild, className, children, ...valueTextProps } = props;
  const context = useCircularProgressContext(VALUE_TEXT_NAME);

  const ValueTextPrimitive = asChild ? Slot : "span";

  return (
    <ValueTextPrimitive
      data-state={context.state}
      {...valueTextProps}
      className={cn(
        "absolute inset-0 flex items-center justify-center font-medium text-sm",
        className,
      )}
    >
      {children ?? context.valueLabel}
    </ValueTextPrimitive>
  );
}

export {
  CircularProgressRoot as Root,
  CircularProgressIndicator as Indicator,
  CircularProgressTrack as Track,
  CircularProgressRange as Range,
  CircularProgressLabel as Label,
  CircularProgressValueText as ValueText,
  //
  CircularProgressRoot as CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
  CircularProgressRange,
  CircularProgressLabel,
  CircularProgressValueText,
  //
  type CircularProgressRootProps as CircularProgressProps,
};
