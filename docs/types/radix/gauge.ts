import type { CompositionProps, EmptyProps } from "@/types";

export interface GaugeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The current gauge value as a number between the min and max values.
   * Set to `null` or `undefined` for indeterminate state.
   *
   * ```ts
   * value={75}
   * ```
   */
  value?: number | null | undefined;

  /**
   * A function that returns the accessible text representation of the current value.
   * Useful for providing custom formatting or localization.
   *
   * ```ts
   * // Show percentage with symbol
   * getValueText={(value, min, max) => {
   *   const percentage = ((value - min) / (max - min)) * 100;
   *   return `${Math.round(percentage)}%`;
   * }}
   *
   * // Show fraction
   * getValueText={(value, min, max) => `${value}/${max}`}
   *
   * // Show raw value
   * getValueText={(value) => Math.round(value).toString()}
   * ```
   *
   * @default (value, min, max) => Math.round(((value - min) / (max - min)) * 100).toString()
   */
  getValueText?(value: number, min: number, max: number): string;

  /**
   * The maximum allowed value for the gauge.
   * Must be a positive number greater than 0.
   *
   * @default 100
   */
  max?: number;

  /**
   * The minimum allowed value for the gauge.
   *
   * @default 0
   */
  min?: number;

  /**
   * The size of the gauge in pixels.
   * This determines both the width and height of the component.
   *
   * @default 120
   */
  size?: number;

  /**
   * The thickness of the gauge track and range in pixels.
   * A larger value creates a thicker gauge arc.
   *
   * @default 8
   */
  thickness?: number;

  /**
   * The starting angle of the gauge arc in degrees.
   * 0° is at the 12 o'clock position (top), increasing clockwise.
   *
   * ```ts
   * startAngle={0}   // Start at 12 o'clock (top)
   * startAngle={90}  // Start at 3 o'clock (right)
   * startAngle={180} // Start at 6 o'clock (bottom)
   * startAngle={270} // Start at 9 o'clock (left)
   * ```
   *
   * @default 0
   */
  startAngle?: number;

  /**
   * The ending angle of the gauge arc in degrees.
   * 0° is at the 12 o'clock position (top), increasing clockwise.
   *
   * ```ts
   * endAngle={180} // Half circle (top to bottom)
   * endAngle={270} // Three-quarter circle
   * endAngle={360} // Full circle (complete rotation back to top)
   * ```
   *
   * @default 360
   */
  endAngle?: number;
}

export interface GaugeIndicatorProps extends EmptyProps<"svg"> {}

export interface GaugeTrackProps extends EmptyProps<"path"> {}

export interface GaugeRangeProps extends EmptyProps<"path"> {}

export interface GaugeValueTextProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface GaugeLabelProps extends EmptyProps<"div">, CompositionProps {}
