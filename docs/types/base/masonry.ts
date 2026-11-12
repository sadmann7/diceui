import type { RenderProps } from "@/types";

export interface MasonryProps extends RenderProps {
  /**
   * The width of each column in pixels.
   * @default 200
   */
  columnWidth?: number;

  /**
   * The number of columns to display, calculated from the container width and `columnWidth` if not provided.
   */
  columnCount?: number;

  /**
   * The maximum number of columns to display for responsive layout.
   * Ignored when `columnCount` is provided.
   */
  maxColumnCount?: number;

  /**
   * The gap between items in pixels, or separate column and row gaps.
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
   * @default 300
   */
  itemHeight?: number;

  /**
   * The default width of the container during server-side rendering, before it can be measured.
   */
  defaultWidth?: number;

  /**
   * The default height of the container during server-side rendering, before it can be measured.
   */
  defaultHeight?: number;

  /**
   * The number of viewport heights to render outside the visible area.
   * @default 2
   */
  overscan?: number;

  /**
   * The maximum number of scroll position updates per second.
   * @default 12
   */
  scrollFps?: number;

  /**
   * Fallback content to show when the masonry is not mounted.
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

export interface MasonryItemProps extends RenderProps {}
