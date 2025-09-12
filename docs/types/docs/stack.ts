import type * as React from "react";
import type {
  CompositionProps,
  Direction,
  EmptyProps,
  Orientation,
} from "@/types";

type Alignment = "start" | "center" | "end";

export interface RootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The orientation of the stack layout.
   *
   * @default "horizontal"
   */
  orientation?: Orientation;

  /**
   * The alignment of items in the stack.
   *
   * @default "center"
   */
  align?: Alignment;

  /**
   * The maximum number of items to display before showing overflow indicator.
   *
   * @default undefined
   */
  max?: number;

  /**
   * The spacing between items in the stack.
   *
   * @default "sm"
   */
  spacing?: "xs" | "sm" | "md" | "lg" | "xl";

  /**
   * Whether items should overlap (like avatar stack).
   *
   * @default false
   */
  overlap?: boolean;

  /**
   * When `true`, reverses the visual order of items.
   *
   * @default false
   */
  reverse?: boolean;

  /**
   * The reading direction of the stack.
   *
   * @default "ltr"
   */
  dir?: Direction;
}

export interface ItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The value/identifier for this stack item.
   */
  value?: string;

  /**
   * When `true`, prevents interaction with this item.
   *
   * @default false
   */
  disabled?: boolean;
}

export interface OverflowProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The number of remaining items not displayed.
   */
  count?: number;
}
