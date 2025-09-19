import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
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
   * getValueText={(value, max) => `${value} of ${max} completed`}
   * ```
   *
   * @default (value, max) => Math.round((value / max) * 100) + "%"
   */
  getValueText?(value: number, max: number): string;

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
   * The width of the progress track and range in pixels.
   * A larger value creates a thicker progress ring.
   *
   * @default 4
   */
  trackWidth?: number;
}

export interface IndicatorProps extends EmptyProps<"svg"> {}

export interface TrackProps extends EmptyProps<"circle"> {}

export interface RangeProps extends EmptyProps<"circle"> {}

export interface ValueTextProps extends EmptyProps<"span">, CompositionProps {}
