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
   * getValueText={(value, min, max) => `${value}/${max}`}
   * ```
   *
   * @default (value, min, max) => Math.round(((value - min) / (max - min)) * 100) + "%"
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
   * 0° is at the 3 o'clock position, increasing clockwise.
   *
   * ```ts
   * startAngle={-90} // Start at 12 o'clock
   * startAngle={135} // Start at 8 o'clock
   * ```
   *
   * @default 0
   */
  startAngle?: number;

  /**
   * The ending angle of the gauge arc in degrees.
   * 0° is at the 3 o'clock position, increasing clockwise.
   *
   * ```ts
   * endAngle={180} // Half circle
   * endAngle={270} // Three-quarter circle
   * endAngle={360} // Full circle
   * ```
   *
   * @default 360
   */
  endAngle?: number;

  /**
   * An accessible label for the gauge.
   * This is used for screen readers and doesn't render visually in the Gauge component.
   * Use the GaugeLabel component for a visible label.
   */
  label?: string;
}

export interface GaugeIndicatorProps extends EmptyProps<"svg"> {}

export interface GaugeTrackProps extends EmptyProps<"path"> {}

export interface GaugeRangeProps extends EmptyProps<"path"> {}

export interface GaugeValueTextProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface GaugeLabelProps extends EmptyProps<"div">, CompositionProps {}
