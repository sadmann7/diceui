import type { CompositionProps, EmptyProps } from "@/types";

/**
 * Props for the Stack root component.
 */
export interface StackProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Direction from which items stack.
   * - "top": Items stack upward from the top
   * - "bottom": Items stack downward from the bottom
   * @default "bottom"
   */
  side?: "top" | "bottom";

  /**
   * Number of items visible in the collapsed state.
   * @default 3
   */
  itemCount?: number;

  /**
   * Number of items visible in the expanded state.
   * When undefined, all items will be shown when expanded.
   * @default undefined (all items)
   */
  expandedItemCount?: number;

  /**
   * Gap between items when expanded (in pixels).
   * @default 8
   */
  gap?: number;

  /**
   * Scale factor for each subsequent item in collapsed state.
   * Each item is scaled down by this factor.
   * @default 0.05 (5% smaller per item)
   */
  scale?: number;

  /**
   * Vertical offset between items in collapsed state (in pixels).
   * @default 10
   */
  offset?: number;

  /**
   * Whether to expand the stack on hover.
   * @default false
   */
  expandOnHover?: boolean;
}

/**
 * Props for individual Stack items.
 */
export interface StackItemProps extends EmptyProps<"div">, CompositionProps {}
