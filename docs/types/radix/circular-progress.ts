import type { CompositionProps, EmptyProps } from "@/types";

export interface CircularProgressProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The current progress value as a number between the min and max values.
   * Set to `null` or `undefined` for indeterminate progress.
   */
  value?: number | null | undefined;

  /**
   * A function that returns the accessible text representation of the current value.
   * Useful for providing custom formatting or localization.
   *
   * ```ts
   * getValueText={(value, min, max) => `${value} of ${max} completed`}
   * ```
   *
   * @default (value, min, max) => Math.round(((value - min) / (max - min)) * 100) + "%"
   */
  getValueText?(value: number, min: number, max: number): string;

  /**
   * The maximum allowed value for the progress.
   * Must be a positive number greater than 0.
   *
   * @default 100
   */
  max?: number;

  /**
   * The minimum allowed value for the progress.
   *
   * @default 0
   */
  min?: number;

  /**
   * The size of the circular progress in pixels.
   * This determines both the width and height of the component.
   *
   * @default 48
   */
  size?: number;

  /**
   * The thickness of the progress track and range in pixels.
   * A larger value creates a thicker progress ring.
   *
   * @default 4
   */
  thickness?: number;
}

export interface CircularProgressIndicatorProps extends EmptyProps<"svg"> {}

export interface CircularProgressTrackProps extends EmptyProps<"circle"> {}

export interface CircularProgressRangeProps extends EmptyProps<"circle"> {}

export interface CircularProgressValueTextProps
  extends EmptyProps<"span">,
    CompositionProps {}
