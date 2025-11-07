import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface SegmentedInputRootProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The size of all inputs in the segment.
   * @default "default"
   */
  size?: "default" | "sm" | "lg";

  /**
   * The reading direction of the segmented input.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the segmented input.
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * Whether all inputs in the segment are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether all inputs in the segment are in an invalid state.
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether all inputs in the segment are required.
   * @default false
   */
  required?: boolean;
}

export interface SegmentedInputItemProps
  extends EmptyProps<"input">,
    CompositionProps {
  /**
   * The position of the input within the segment.
   * Controls the visual styling and borders.
   *
   * If not provided, it will be automatically detected based on the input's position:
   * - "isolated": Single standalone input in the segment
   * - "first": First input in the segment
   * - "middle": Middle input in the segment
   * - "last": Last input in the segment
   *
   * @default Auto-detected based on position in children array
   */
  position?: "first" | "middle" | "last" | "isolated";

  /**
   * Whether the input is disabled.
   * Inherits from the SegmentedInput if not specified.
   */
  disabled?: boolean;

  /**
   * Whether the input is required.
   * Inherits from the SegmentedInput if not specified.
   */
  required?: boolean;
}
