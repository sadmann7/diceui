import type * as React from "react";
import type { CompositionProps, EmptyProps } from "@/types";

/**
 * Props for the Stack root component.
 */
export interface StackRootProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Maximum number of visible stacked items before collapsing.
   * @default 3
   */
  visibleItems?: number;

  /**
   * Gap between stacked items in pixels.
   * @default 8
   */
  gap?: number;

  /**
   * Scale reduction factor for each stacked item.
   * @default 0.05
   */
  scaleFactor?: number;

  /**
   * Enable hover expansion effect.
   * @default true
   */
  expandOnHover?: boolean;

  /**
   * Offset for each stacked item in pixels.
   * @default 10
   */
  offset?: number;
}

/**
 * Props for individual Stack items.
 */
export interface StackItemProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Unique identifier for the stack item.
   */
  id?: string | number;
}
