import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The unique identifier for the time picker component.
   * @default React.useId()
   */
  id?: string;

  /**
   * The default value for uncontrolled usage.
   * Format: "HH:mm" or "HH:mm:ss"
   * @default ""
   *
   * ```ts
   * defaultValue="14:30"
   * ```
   */
  defaultValue?: string;

  /**
   * The controlled value of the time picker component.
   * Format: "HH:mm" or "HH:mm:ss"
   *
   * ```ts
   * value="14:30"
   * ```
   */
  value?: string;

  /**
   * Event handler called when the value changes.
   *
   * ```ts
   * onValueChange={(value) => {
   *   console.log("Time value:", value)
   * }}
   * ```
   */
  onValueChange?: (value: string) => void;

  /**
   * The controlled open state of the time picker.
   * Must be used in conjunction with `onOpenChange`.
   */
  open?: boolean;

  /**
   * The default open state for uncontrolled usage.
   * Use when you do not need to control its open state.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Event handler called when the open state changes.
   *
   * ```ts
   * onOpenChange={(open) => {
   *   console.log("Time picker open:", open)
   * }}
   * ```
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Whether to open the popover when the input is focused.
   * @default false
   */
  openOnFocus?: boolean;

  /**
   * The name of the time picker for form submission.
   */
  name?: string;

  /**
   * Whether the time picker component is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the time picker component is read-only.
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the time picker component is required.
   * @default false
   */
  required?: boolean;

  /**
   * Whether the time picker component is in an invalid state.
   * @default false
   */
  invalid?: boolean;

  /**
   * The minimum time value allowed.
   * Format: "HH:mm" or "HH:mm:ss"
   *
   * ```ts
   * min="09:00"
   * ```
   */
  min?: string;

  /**
   * The maximum time value allowed.
   * Format: "HH:mm" or "HH:mm:ss"
   *
   * ```ts
   * max="17:00"
   * ```
   */
  max?: string;

  /**
   * Whether to show seconds in the time picker.
   * @default false
   */
  showSeconds?: boolean;

  /**
   * Optional locale to determine time format display (12-hour vs 24-hour).
   * If not provided, uses the browser's default locale.
   * The value is always stored in 24-hour format (HH:mm or HH:mm:ss).
   * Display format is auto-detected from locale settings.
   *
   * ```ts
   * // 12-hour format with AM/PM
   * locale="en-US"
   * ```
   *
   * ```ts
   * // 24-hour format
   * locale="en-GB"
   * ```
   */
  locale?: string;

  /**
   * The interval for minute selection (in minutes).
   * @default 1
   *
   * ```ts
   * minuteStep={15} // for 15-minute intervals
   * ```
   */
  minuteStep?: number;

  /**
   * The interval for second selection (in seconds).
   * @default 1
   *
   * ```ts
   * secondStep={10} // for 10-second intervals
   * ```
   */
  secondStep?: number;

  /**
   * The interval for hour selection (in hours).
   * @default 1
   *
   * ```ts
   * hourStep={2} // for 2-hour intervals
   * ```
   */
  hourStep?: number;

  /**
   * Placeholder text for empty time segments.
   * Can be a string to apply to all segments, or an object to set per-segment placeholders.
   * @default "--"
   *
   * ```ts
   * // All segments use the same placeholder
   * segmentPlaceholder="--"
   * ```
   *
   * ```ts
   * // Each segment with its own placeholder
   * segmentPlaceholder={{ hour: "hh", minute: "mm", second: "ss", period: "aa" }}
   * ```
   */
  segmentPlaceholder?:
    | string
    | {
        hour?: string;
        minute?: string;
        second?: string;
        period?: string;
      };
}

export interface LabelProps extends EmptyProps<"label">, CompositionProps {}

export interface InputGroupProps extends EmptyProps<"div">, CompositionProps {}

export interface TriggerProps extends EmptyProps<"button">, CompositionProps {}

export interface ContentProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The preferred side of the trigger to render against when open.
   * @default "bottom"
   */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * The preferred alignment against the trigger.
   * @default "start"
   */
  align?: "start" | "center" | "end";

  /**
   * The distance in pixels from the trigger.
   * @default 6
   */
  sideOffset?: number;
}

export interface HourProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format for displaying hours.
   * @default "numeric"
   */
  format?: "numeric" | "2-digit";
}

export interface MinuteProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format for displaying minutes.
   * @default "2-digit"
   */
  format?: "numeric" | "2-digit";
}

export interface SecondProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The format for displaying seconds.
   * @default "2-digit"
   */
  format?: "numeric" | "2-digit";
}

export interface PeriodProps extends EmptyProps<"div">, CompositionProps {}

export interface SeparatorProps extends EmptyProps<"span">, CompositionProps {}

export interface ClearProps extends EmptyProps<"button">, CompositionProps {}

export interface InputProps extends EmptyProps<"input">, CompositionProps {
  /**
   * The time segment for the input.
   * - `hour`: The hour segment
   * - `minute`: The minute segment
   * - `second`: The second segment
   * - `period`: The period segment
   *
   * ```ts
   * segment="hour"
   * ```
   */
  segment: "hour" | "minute" | "second" | "period";
}
