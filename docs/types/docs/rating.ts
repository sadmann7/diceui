import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The current rating value.
   *
   * ```ts
   * value={4}
   * ```
   */
  value?: number;

  /**
   * The default rating value for uncontrolled usage.
   *
   * @default 0
   */
  defaultValue?: number;

  /**
   * Event handler called when the rating value changes.
   *
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
   * ```ts
   * max={10}
   * ```
   *
   * @default 5
   */
  max?: number;

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
   * The text direction of the rating component.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the rating component.
   *
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The size of the rating component.
   *
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

  /**
   * The step increment for rating values. Use 0.5 for half-star ratings.
   *
   * ```ts
   * step={0.5} // Allows half-star ratings
   * step={0.25} // Allows quarter-star ratings
   * ```
   *
   * @default 1
   */
  step?: 0.5 | 1;

  /**
   * Whether clicking the same rating value clears the selection.
   *
   * @default false
   */
  clearable?: boolean;

  /**
   * Whether the rating is disabled.
   *
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether the rating is read-only.
   *
   * @default false
   */
  readOnly?: boolean;

  /**
   * Whether the rating is required for form validation.
   *
   * @default false
   */
  required?: boolean;

  /**
   * The name attribute for form submission.
   */
  name?: string;
}

export interface ItemProps extends EmptyProps<"button">, CompositionProps {
  /**
   * The index of this rating item.
   * If not provided, it will be auto-calculated based on position.
   *
   * @example 0
   */
  index?: number;

  /**
   * The content to render inside the rating item.
   * Can be a React node or a function that receives the data state.
   *
   * ```ts
   * children={<Star />}
   * // or
   * children={(state) => (
   *   <Star className={state === "full" ? "text-yellow-500" : "text-gray-300"} />
   * )}
   * ```
   */
  children?:
    | React.ReactNode
    | ((dataState: "full" | "partial" | "empty") => React.ReactNode);
}
