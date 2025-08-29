import type { CompositionProps, Direction, EmptyProps } from "@/types";

export interface InputGroupRootProps
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * The unique identifier for the input group.
   */
  id?: string;

  /**
   * The reading direction of the input group.
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The orientation of the input group.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The size of all inputs in the group.
   * @default "default"
   */
  size?: "sm" | "default" | "lg";

  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether all inputs in the group are disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether all inputs in the group are in an invalid state.
   * @default false
   */
  invalid?: boolean;

  /**
   * Whether all inputs in the group are required.
   * @default false
   */
  required?: boolean;

  /**
   * Whether to enable arrow key navigation between inputs.
   * When enabled, users can navigate between inputs using arrow keys
   * when the cursor is at the start/end of the input text.
   * @default false
   */
  arrowNavigation?: boolean;

  /**
   * Whether to enable looping navigation when using arrow keys.
   * When enabled with arrowNavigation, navigation wraps around
   * from the last input to the first and vice versa.
   * Only takes effect when arrowNavigation is true.
   * @default false
   */
  loop?: boolean;
}

export interface InputGroupItemProps
  extends EmptyProps<"input">,
    CompositionProps {
  /**
   * The position of the input within the group.
   * Controls the visual styling and borders.
   * @default "isolated"
   */
  position?: "first" | "middle" | "last" | "isolated";

  /**
   * Whether to render as a child component.
   * @default false
   */
  asChild?: boolean;

  /**
   * Whether the input is disabled.
   * Inherits from the InputGroup if not specified.
   */
  disabled?: boolean;

  /**
   * Whether the input is required.
   * Inherits from the InputGroup if not specified.
   */
  required?: boolean;
}
