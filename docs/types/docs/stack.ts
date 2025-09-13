import type * as React from "react";
import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

export interface StackProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The size of each stack item in pixels.
   * @default 40
   */
  size?: number;

  /**
   * Maximum number of items to display. When exceeded, shows overflow indicator.
   */
  max?: number;

  /**
   * Render as a child element, inheriting props from the parent.
   * @default false
   */
  asChild?: boolean;

  /**
   * Reverse the stacking order.
   * @default false
   */
  reverse?: boolean;

  /**
   * The orientation of the stack.
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The reading direction of the stack.
   * @default "ltr"
   */
  dir?: Direction;
}
