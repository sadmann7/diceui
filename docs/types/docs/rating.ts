import type { CompositionProps, EmptyProps } from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The current rating value.
   *
   * @example 3.5
   */
  value?: number;

  /**
   * The default rating value for uncontrolled usage.
   *
   * @default 0
   * @example 3
   */
  defaultValue?: number;

  /**
   * Event handler called when the rating value changes.
   *
   * @example
   * ```ts
   * onValueChange={(value) => {
   *   console.log("Rating:", value)
   * }}
   * ```
   */
  onValueChange?: (value: number) => void;

  /**
   * The maximum rating value.
   *
   * @default 5
   * @example 10
   */
  max?: number;

  /**
   * The size of the rating component.
   *
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

  /**
   * Whether the rating allows half values.
   *
   * @default false
   */
  allowHalf?: boolean;

  /**
   * Whether clicking the same rating value clears the selection.
   *
   * @default false
   */
  allowClear?: boolean;

  /**
   * Whether the rating is read-only.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the rating is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Controls how ratings are activated during keyboard navigation.
   *
   * - `"automatic"`: Arrow keys immediately activate the focused rating (selection follows focus)
   * - `"manual"`: Arrow keys only move focus, Enter/Space keys activate the focused rating
   *
   * @default "automatic"
   */
  activationMode?: "automatic" | "manual";

  /**
   * The name attribute for form submission.
   */
  name?: string;

  /**
   * Whether the rating is required for form validation.
   *
   * @default false
   */
  required?: boolean;

  /**
   * Whether the rating is in an invalid state.
   *
   * @default false
   */
  invalid?: boolean;
}

export interface ItemProps extends EmptyProps<"button">, CompositionProps {
  /**
   * The index of this rating item.
   * If not provided, it will be auto-calculated based on position.
   *
   * @example 0
   */
  index?: number;
}
