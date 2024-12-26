import * as React from "react";
import type { ProgressState } from "../types";

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isValidMaxNumber(max: unknown): max is number {
  return isNumber(max) && !Number.isNaN(max) && max > 0;
}

function isValidValueNumber(value: unknown, max: number): value is number {
  return isNumber(value) && !Number.isNaN(value) && value <= max && value >= 0;
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

interface UseProgressProps {
  /**
   * The current progress value.
   * @default null
   */
  value?: number | null;

  /**
   * The maximum progress value.
   * @default 100
   */
  max?: number;
}

function useProgress({
  value: valueProp = null,
  max: maxProp,
}: UseProgressProps) {
  const max = React.useMemo(
    () => (isValidMaxNumber(maxProp) ? maxProp : 100),
    [maxProp],
  );

  const value = React.useMemo(
    () => (isValidValueNumber(valueProp, max) ? valueProp : null),
    [valueProp, max],
  );

  const state = React.useMemo<ProgressState>(
    () => getProgressState(value, max),
    [value, max],
  );

  const progressProps = React.useMemo<React.HTMLAttributes<HTMLDivElement>>(
    () => ({
      role: "progressbar",
      "aria-valuemin": 0,
      "aria-valuemax": max,
      ...(isNumber(value) && { "aria-valuenow": value }),
      "data-state": state,
      "data-value": value ?? undefined,
      "data-max": max,
    }),
    [max, value, state],
  );

  return {
    value,
    max,
    state,
    progressProps,
  };
}

export { useProgress, getProgressState };
