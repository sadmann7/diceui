import type { SlotProps } from "@radix-ui/react-slot";
import type { CompositionProps } from "@/types";

export interface RootProps
  extends Omit<SlotProps, keyof React.ComponentProps<"div">>,
    CompositionProps {
  /**
   * The width of each column in pixels.
   * @default 200
   */
  columnWidth?: number;

  /**
   * The number of columns to display.
   *
   * If not provided, it will be calculated based on the container width and columnWidth.
   */
  columnCount?: number;

  /**
   * The maximum number of columns to display for responsive layout.
   *
   * If not provided, it will be calculated based on the container width and columnWidth.
   *
   * If `columnCount` is provided, it will be ignored.
   */
  maxColumnCount?: number;

  /**
   * The gap between items in pixels.
   *
   * Can be a number for equal gaps, or an object specifying different column and row gaps.
   *
   * ```ts
   * // Equal gaps
   * gap={16}
   * // Different column and row gaps
   * gap={{ column: 16, row: 24 }}
   * ```
   * @default 0
   */
  gap?: number | { column: number; row: number };

  /**
   * The default height for items before they are measured.
   *
   * Used for estimating the total height of the masonry layout.
   * @default 300
   */
  itemHeight?: number;

  /**
   * The default width of the container during server-side rendering.
   *
   * Used before the actual container width can be measured.
   */
  defaultWidth?: number;

  /**
   * The default height of the container during server-side rendering.
   *
   * Used before the actual container height can be measured.
   */
  defaultHeight?: number;

  /**
   * The number of viewport heights to render outside the visible area.
   *
   * Larger values reduce blank space when scrolling but increase memory usage.
   * @default 2
   */
  overscan?: number;

  /**
   * The maximum number of scroll position updates per second.
   * Higher values make scrolling more responsive but may impact performance.
   * @default 12
   */
  scrollFps?: number;

  /**
   * Fallback content to show when the masonry is not mounted.
   *
   * Useful for server-side rendering and initial load states.
   *
   * ```tsx
   * fallback={<LoadingPlaceholder />}
   * ```
   */
  fallback?: React.ReactNode;

  /**
   * Whether to use linear layout instead of optimal layout.
   *
   * Linear layout places items in order from left to right, while optimal layout
   * places items to minimize vertical gaps.
   * @default false
   */
  linear?: boolean;
}

export interface ItemProps
  extends Omit<SlotProps, keyof React.ComponentProps<"div">>,
    CompositionProps {}
