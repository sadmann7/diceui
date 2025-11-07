import type { CompositionProps, Direction, EmptyProps } from "@/types";

export interface SegmentedInputRootProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The unique identifier for the segmented input.
   */
  id?: string;

  /**
   * The reading direction of the segmented input.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the segmented input.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The size of all inputs in the segment.
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

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
   * @default "isolated"
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
