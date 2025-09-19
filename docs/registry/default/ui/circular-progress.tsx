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
  max: number;
  min: number;
  valueLabel: string | undefined;
  state: ProgressState;
  radius: number;
  strokeWidth: number;
  size: number;
  onValueChange?(value: number | null): void;
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

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface CircularProgressRootProps extends DivProps {
  value?: number | null | undefined;
  max?: number;
  min?: number;
  size?: number;
  strokeWidth?: number;
  onValueChange?(value: number | null): void;
  getValueLabel?(value: number, max: number): string;
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
    strokeWidth = 4,
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
  const radius = (size - strokeWidth) / 2;

  const contextValue = React.useMemo<CircularProgressContextValue>(
    () => ({
      value,
      max,
      min,
      valueLabel,
      state,
      radius,
      strokeWidth,
      size,
      onValueChange,
    }),
    [
      value,
      max,
      min,
      valueLabel,
      state,
      radius,
      strokeWidth,
      size,
      onValueChange,
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

interface CircularProgressIndicatorProps extends React.ComponentProps<"svg"> {
  asChild?: boolean;
}

function CircularProgressIndicator(props: CircularProgressIndicatorProps) {
  const { asChild, className, ...indicatorProps } = props;
  const context = useCircularProgressContext(INDICATOR_NAME);
  const { size } = context;

  if (asChild) {
    return (
      <Slot
        data-state={context.state}
        data-value={context.value ?? undefined}
        data-max={context.max}
        data-min={context.min}
        className={cn("-rotate-90 transform", className)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      data-state={context.state}
      data-value={context.value ?? undefined}
      data-max={context.max}
      data-min={context.min}
      {...indicatorProps}
      className={cn("-rotate-90 transform", className)}
    />
  );
}

interface CircularProgressTrackProps extends React.ComponentProps<"circle"> {}

function CircularProgressTrack(props: CircularProgressTrackProps) {
  const { className, ...trackProps } = props;
  const context = useCircularProgressContext(TRACK_NAME);
  const { size, strokeWidth, radius } = context;

  const center = size / 2;

  return (
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      data-state={context.state}
      {...trackProps}
      className={cn("text-muted-foreground/20", className)}
    />
  );
}

interface CircularProgressRangeProps extends React.ComponentProps<"circle"> {}

function CircularProgressRange(props: CircularProgressRangeProps) {
  const { className, ...rangeProps } = props;
  const context = useCircularProgressContext(RANGE_NAME);
  const { size, strokeWidth, radius, value, max, min, state } = context;

  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let strokeDasharray = circumference;
  let strokeDashoffset = circumference;

  if (state === "indeterminate") {
    strokeDasharray = circumference * 0.25;
    strokeDashoffset = 0;
  } else if (value !== null) {
    const normalizedValue = ((value - min) / (max - min)) * 100;
    const progress = (normalizedValue / 100) * circumference;
    strokeDashoffset = circumference - progress;
  }

  return (
    <circle
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      data-state={state}
      data-value={value ?? undefined}
      data-max={max}
      data-min={min}
      {...rangeProps}
      className={cn(
        "text-primary transition-all duration-300 ease-in-out",
        state === "indeterminate" && "animate-spin",
        className,
      )}
      style={{
        ...rangeProps.style,
        animationDuration: state === "indeterminate" ? "2s" : undefined,
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
  type CircularProgressIndicatorProps,
  type CircularProgressTrackProps,
  type CircularProgressRangeProps,
  type CircularProgressLabelProps,
  type CircularProgressValueTextProps,
};
