"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const GAUGE_NAME = "Gauge";
const INDICATOR_NAME = "GaugeIndicator";
const TRACK_NAME = "GaugeTrack";
const RANGE_NAME = "GaugeRange";
const VALUE_TEXT_NAME = "GaugeValueText";
const LABEL_NAME = "GaugeLabel";

const DEFAULT_MAX = 100;
const DEFAULT_START_ANGLE = 0;
const DEFAULT_END_ANGLE = 360;

type GaugeState = "indeterminate" | "complete" | "loading";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface PathProps extends React.ComponentProps<"path"> {}

function getGaugeState(
  value: number | undefined | null,
  maxValue: number,
): GaugeState {
  return value == null
    ? "indeterminate"
    : value === maxValue
      ? "complete"
      : "loading";
}

function getIsValidNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function getIsValidMaxNumber(max: unknown): max is number {
  return getIsValidNumber(max) && max > 0;
}

function getIsValidValueNumber(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return getIsValidNumber(value) && value <= max && value >= min;
}

function getDefaultValueText(value: number, min: number, max: number): string {
  const percentage = max === min ? 100 : ((value - min) / (max - min)) * 100;
  return `${Math.round(percentage)}%`;
}

function getInvalidValueError(
  propValue: string,
  componentName: string,
): string {
  return `Invalid prop \`value\` of value \`${propValue}\` supplied to \`${componentName}\`. The \`value\` prop must be a number between \`min\` and \`max\` (inclusive), or \`null\`/\`undefined\` for indeterminate state. The value will be clamped to the valid range.`;
}

function getInvalidMaxError(propValue: string, componentName: string): string {
  return `Invalid prop \`max\` of value \`${propValue}\` supplied to \`${componentName}\`. Only numbers greater than 0 are valid. Defaulting to ${DEFAULT_MAX}.`;
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const angleDiff = endAngle - startAngle;

  // For full circles (360 degrees), draw as two semi-circles
  if (Math.abs(angleDiff) >= 360) {
    const mid = polarToCartesian(x, y, radius, startAngle + 180);
    const end = polarToCartesian(x, y, radius, startAngle + 360);
    return [
      "M",
      mid.x,
      mid.y,
      "A",
      radius,
      radius,
      0,
      0,
      1,
      end.x,
      end.y,
      "A",
      radius,
      radius,
      0,
      0,
      1,
      mid.x,
      mid.y,
    ].join(" ");
  }

  const start = polarToCartesian(x, y, radius, startAngle);
  const end = polarToCartesian(x, y, radius, endAngle);
  const largeArcFlag = angleDiff <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
  ].join(" ");
}

interface GaugeContextValue {
  value: number | null;
  valueText: string | undefined;
  max: number;
  min: number;
  state: GaugeState;
  radius: number;
  thickness: number;
  size: number;
  center: number;
  percentage: number | null;
  startAngle: number;
  endAngle: number;
  arcLength: number;
  arcCenterY: number;
  valueTextId?: string;
  labelId?: string;
}

const GaugeContext = React.createContext<GaugeContextValue | null>(null);

function useGaugeContext(consumerName: string) {
  const context = React.useContext(GaugeContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`${GAUGE_NAME}\``,
    );
  }
  return context;
}

interface GaugeProps extends DivProps {
  value?: number | null | undefined;
  getValueText?(value: number, min: number, max: number): string;
  min?: number;
  max?: number;
  size?: number;
  thickness?: number;
  startAngle?: number;
  endAngle?: number;
  label?: string;
}

function Gauge(props: GaugeProps) {
  const {
    value: valueProp = null,
    getValueText = getDefaultValueText,
    min: minProp = 0,
    max: maxProp,
    size = 120,
    thickness = 8,
    startAngle = DEFAULT_START_ANGLE,
    endAngle = DEFAULT_END_ANGLE,
    label,
    asChild,
    className,
    ...gaugeProps
  } = props;

  if ((maxProp || maxProp === 0) && !getIsValidMaxNumber(maxProp)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(getInvalidMaxError(`${maxProp}`, GAUGE_NAME));
    }
  }

  const rawMax = getIsValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
  const min = getIsValidNumber(minProp) ? minProp : 0;
  const max = rawMax <= min ? min + 1 : rawMax;

  if (process.env.NODE_ENV !== "production" && thickness >= size) {
    console.warn(
      `Gauge: thickness (${thickness}) should be less than size (${size}) for proper rendering.`,
    );
  }

  if (valueProp !== null && !getIsValidValueNumber(valueProp, min, max)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(getInvalidValueError(`${valueProp}`, GAUGE_NAME));
    }
  }

  const value = getIsValidValueNumber(valueProp, min, max)
    ? valueProp
    : getIsValidNumber(valueProp) && valueProp > max
      ? max
      : getIsValidNumber(valueProp) && valueProp < min
        ? min
        : null;

  const valueText = getIsValidNumber(value)
    ? getValueText(value, min, max)
    : undefined;
  const state = getGaugeState(value, max);
  const radius = Math.max(0, (size - thickness) / 2);
  const center = size / 2;

  // Calculate arc length based on angles
  const angleDiff = Math.abs(endAngle - startAngle);
  const arcLength = (Math.min(angleDiff, 360) / 360) * (2 * Math.PI * radius);

  const percentage = getIsValidNumber(value)
    ? max === min
      ? 1
      : (value - min) / (max - min)
    : null;

  // Calculate the visual center Y of the arc for text positioning
  // For full circles, use geometric center. For partial arcs, adjust based on arc position
  const angleDiffDeg = Math.abs(endAngle - startAngle);
  const isFullCircle = angleDiffDeg >= 360;

  let arcCenterY = center;
  if (!isFullCircle) {
    const midAngle = (startAngle + endAngle) / 2;
    const midAngleRad = ((midAngle - 90) * Math.PI) / 180;
    arcCenterY = center + radius * 0.4 * Math.sin(midAngleRad);
  }

  const labelId = React.useId();
  const valueTextId = React.useId();

  const contextValue = React.useMemo<GaugeContextValue>(
    () => ({
      value,
      valueText,
      max,
      min,
      state,
      radius,
      thickness,
      size,
      center,
      percentage,
      startAngle,
      endAngle,
      arcLength,
      arcCenterY,
      valueTextId,
      labelId,
    }),
    [
      value,
      valueText,
      max,
      min,
      state,
      radius,
      thickness,
      size,
      center,
      percentage,
      startAngle,
      endAngle,
      arcLength,
      arcCenterY,
      valueTextId,
      labelId,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <GaugeContext.Provider value={contextValue}>
      <RootPrimitive
        role="meter"
        aria-describedby={valueText ? valueTextId : undefined}
        aria-labelledby={label ? labelId : undefined}
        aria-valuemax={max}
        aria-valuemin={min}
        aria-valuenow={getIsValidNumber(value) ? value : undefined}
        aria-valuetext={valueText}
        data-state={state}
        data-value={value ?? undefined}
        data-max={max}
        data-min={min}
        data-percentage={percentage}
        {...gaugeProps}
        className={cn(
          "relative inline-flex w-fit flex-col items-center justify-center",
          className,
        )}
      />
    </GaugeContext.Provider>
  );
}

function GaugeIndicator(props: React.ComponentProps<"svg">) {
  const { className, ...indicatorProps } = props;

  const { size, state, value, max, min, percentage } =
    useGaugeContext(INDICATOR_NAME);

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${size} ${size}`}
      data-state={state}
      data-value={value ?? undefined}
      data-max={max}
      data-min={min}
      data-percentage={percentage}
      width={size}
      height={size}
      {...indicatorProps}
      className={cn("transform", className)}
    />
  );
}

function GaugeTrack(props: PathProps) {
  const { className, ...trackProps } = props;

  const { center, radius, startAngle, endAngle, thickness, state } =
    useGaugeContext(TRACK_NAME);

  const pathData = describeArc(center, center, radius, startAngle, endAngle);

  return (
    <path
      data-state={state}
      d={pathData}
      fill="none"
      stroke="currentColor"
      strokeWidth={thickness}
      strokeLinecap="round"
      vectorEffect="non-scaling-stroke"
      {...trackProps}
      className={cn("text-muted-foreground/20", className)}
    />
  );
}

function GaugeRange(props: PathProps) {
  const { className, ...rangeProps } = props;

  const {
    center,
    radius,
    startAngle,
    endAngle,
    value,
    max,
    min,
    state,
    thickness,
    arcLength,
    percentage,
  } = useGaugeContext(RANGE_NAME);

  // Always draw the full arc path
  const pathData = describeArc(center, center, radius, startAngle, endAngle);

  // Use stroke-dasharray/dashoffset to animate the fill
  const strokeDasharray = arcLength;
  const strokeDashoffset =
    state === "indeterminate"
      ? 0
      : percentage !== null
        ? arcLength - percentage * arcLength
        : arcLength;

  return (
    <path
      data-state={state}
      data-value={value ?? undefined}
      data-max={max}
      data-min={min}
      d={pathData}
      fill="none"
      stroke="currentColor"
      strokeWidth={thickness}
      strokeLinecap="round"
      strokeDasharray={strokeDasharray}
      strokeDashoffset={strokeDashoffset}
      vectorEffect="non-scaling-stroke"
      {...rangeProps}
      className={cn(
        "text-primary transition-[stroke-dashoffset] duration-700 ease-out",
        className,
      )}
    />
  );
}

function GaugeValueText(props: DivProps) {
  const { asChild, className, children, style, ...valueTextProps } = props;

  const { valueTextId, state, arcCenterY, valueText } =
    useGaugeContext(VALUE_TEXT_NAME);

  const ValueTextPrimitive = asChild ? Slot : "div";

  return (
    <ValueTextPrimitive
      id={valueTextId}
      data-state={state}
      {...valueTextProps}
      style={{
        top: `${arcCenterY}px`,
        ...style,
      }}
      className={cn(
        "absolute right-0 left-0 flex -translate-y-1/2 items-center justify-center font-semibold text-2xl",
        className,
      )}
    >
      {children ?? valueText}
    </ValueTextPrimitive>
  );
}

function GaugeLabel(props: DivProps) {
  const { asChild, className, ...labelProps } = props;

  const { labelId, state } = useGaugeContext(LABEL_NAME);

  const LabelPrimitive = asChild ? Slot : "div";

  return (
    <LabelPrimitive
      id={labelId}
      data-state={state}
      {...labelProps}
      className={cn(
        "mt-2 font-medium text-muted-foreground text-sm",
        className,
      )}
    />
  );
}

function GaugeCombined(props: GaugeProps) {
  const { label, children, ...gaugeProps } = props;

  return (
    <Gauge {...gaugeProps}>
      <GaugeIndicator>
        <GaugeTrack />
        <GaugeRange />
      </GaugeIndicator>
      <GaugeValueText>{children}</GaugeValueText>
      {label && <GaugeLabel>{label}</GaugeLabel>}
    </Gauge>
  );
}

export {
  Gauge,
  GaugeIndicator,
  GaugeTrack,
  GaugeRange,
  GaugeValueText,
  GaugeLabel,
  GaugeCombined,
  //
  type GaugeProps,
};
