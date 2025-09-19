import type * as React from "react";
import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The controlled values of the slider.
   */
  value?: number[];

  /**
   * The default values of the slider when uncontrolled.
   */
  defaultValue?: number[];

  /**
   * Event handler called when the values change.
   */
  onValueChange?: (value: number[]) => void;

  /**
   * Event handler called when the values are committed (drag ends).
   */
  onValueCommit?: (value: number[]) => void;

  /**
   * The name of the slider for form submission.
   */
  name?: string;

  /**
   * The minimum value of the slider.
   * @default 0
   */
  min?: number;

  /**
   * The maximum value of the slider.
   * @default 100
   */
  max?: number;

  /**
   * The size (radius) of the circular track in pixels.
   * @default 80
   */
  size?: number;

  /**
   * The width of the track and range lines in pixels.
   * @default 8
   */
  trackWidth?: number;

  /**
   * The starting angle of the slider in degrees.
   * 0° is at 3 o'clock, -90° is at 12 o'clock.
   * @default -90
   */
  startAngle?: number;

  /**
   * The ending angle of the slider in degrees.
   * 0° is at 3 o'clock, 270° is at 9 o'clock.
   * @default 270
   */
  endAngle?: number;

  /**
   * The step size for value increments.
   * @default 1
   */
  step?: number;

  /**
   * The minimum number of steps between thumbs.
   * @default 0
   */
  minStepsBetweenThumbs?: number;

  /**
   * The reading direction of the slider.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the slider.
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The form id to associate the slider with.
   */
  form?: string;

  /**
   * When `true`, prevents the user from interacting with the slider.
   * @default false
   */
  disabled?: boolean;

  /**
   * When `true`, the slider range will be inverted.
   * @default false
   */
  inverted?: boolean;
}

export interface TrackProps extends EmptyProps<"div">, CompositionProps {}

export interface RangeProps extends EmptyProps<"div">, CompositionProps {}

export interface ThumbProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The index of the thumb.
   */
  index?: number;
}

export interface ValueProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unit to display after the value(s).
   *
   * ```ts
   * // Display as percentages
   * unit="%"
   * ```
   *
   * ```ts
   * // No unit
   * unit=""
   * ```
   *
   * @default "°"
   *
   */
  unit?: string;

  /**
   * Custom formatter for the displayed value.
   * Receives the current value(s) and should return a formatted string.
   * For single-value sliders, receives a number.
   * For range sliders, receives an array of numbers.
   *
   * When provided, this overrides the default unit-based formatting.
   *
   * ```ts
   * // Custom percentage formatting
   * formatValue={(value) => `${value}%`}
   * ```
   *
   * ```ts
   * // Custom range formatting with units
   * formatValue={(values) => Array.isArray(values) ? `${values[0]}px - ${values[1]}px` : `${values}px`}
   * ```
   */
  formatValue?: (value: number | number[]) => string;
}
