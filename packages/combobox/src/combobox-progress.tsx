import { Primitive } from "@radix-ui/react-primitive";
import * as React from "react";
import { useComboboxContext } from "./combobox-root";

const DEFAULT_MAX = 100;

function isNumber(value: unknown): value is number {
  return typeof value === "number";
}

function isValidMaxNumber(max: unknown): max is number {
  return isNumber(max) && !Number.isNaN(max) && max > 0;
}

function isValidValueNumber(value: unknown, max: number): value is number {
  return isNumber(value) && !Number.isNaN(value) && value <= max && value >= 0;
}

function getProgressState(value: number | undefined | null, maxValue: number) {
  return value == null
    ? "indeterminate"
    : value === maxValue
      ? "complete"
      : "loading";
}

const PROGRESS_NAME = "ComboboxProgress";

interface ComboboxProgressProps extends React.HTMLAttributes<HTMLDivElement> {
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

  /** The accessible label for the progress bar. */
  label?: string;
}

const ComboboxProgress = React.forwardRef<
  HTMLDivElement,
  ComboboxProgressProps
>((props, forwardedRef) => {
  const context = useComboboxContext(PROGRESS_NAME);

  if (!context.open) return null;

  const {
    value: valueProp = null,
    max: maxProp,
    label,
    ...progressProps
  } = props;
  const max = isValidMaxNumber(maxProp) ? maxProp : DEFAULT_MAX;
  const value = isValidValueNumber(valueProp, max) ? valueProp : null;
  const state = getProgressState(value, max);

  if (state === "complete") return null;

  return (
    <Primitive.div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={isNumber(value) ? value : undefined}
      data-state={state}
      data-value={value ?? undefined}
      data-max={max}
      {...progressProps}
      ref={forwardedRef}
    />
  );
});

ComboboxProgress.displayName = PROGRESS_NAME;

const Progress = ComboboxProgress;

export { ComboboxProgress, Progress };

export type { ComboboxProgressProps };
