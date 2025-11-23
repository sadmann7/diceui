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
   * @example "14:30" or "14:30:45"
   */
  defaultValue?: string;

  /**
   * The controlled value of the time picker component.
   * Format: "HH:mm" or "HH:mm:ss"
   * @example "14:30" or "14:30:45"
   */
  value?: string;

  /**
   * Callback fired when the value changes.
   */
  onValueChange?: (value: string) => void;

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
   * @example "09:00"
   */
  min?: string;

  /**
   * The maximum time value allowed.
   * Format: "HH:mm" or "HH:mm:ss"
   * @example "17:00"
   */
  max?: string;

  /**
   * Whether to show seconds in the time picker.
   * @default false
   */
  showSeconds?: boolean;

  /**
   * Whether to use 12-hour format with AM/PM.
   * @default false
   */
  use12Hours?: boolean;

  /**
   * The interval for minute selection (in minutes).
   * @default 1
   * @example 15 // for 15-minute intervals
   */
  minuteStep?: number;

  /**
   * The interval for second selection (in seconds).
   * @default 1
   */
  secondStep?: number;

  /**
   * The interval for hour selection (in hours).
   * @default 1
   */
  hourStep?: number;

  /**
   * Placeholder text shown when value is empty.
   * @default "Select time"
   */
  placeholder?: string;
}

export interface LabelProps extends EmptyProps<"label">, CompositionProps {}

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
   * @default 4
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
