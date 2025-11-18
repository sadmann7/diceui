import type { CompositionProps, EmptyProps } from "@/types";

export interface BadgeOverflowProps<T = string>
  extends EmptyProps<"div">,
    CompositionProps {
  /**
   * Array of items to display as badges.
   *
   * @example
   * items={["React", "TypeScript", "Next.js"]}
   */
  items: T[];

  /**
   * Function to extract the label from each item.
   *
   * @example
   * getLabel={(item) => item.name}
   */
  getLabel: (item: T) => string;

  /**
   * Maximum number of lines to display badges across.
   *
   * @default 1
   */
  lineCount?: number;

  /**
   * Prefix for cache keys when measuring badge widths.
   * Useful when you have multiple BadgeOverflow instances with similar items.
   *
   * @example
   * cacheKeyPrefix="tags"
   */
  cacheKeyPrefix?: string;

  /**
   * Size of icon in pixels if badges contain icons.
   */
  iconSize?: number;

  /**
   * Maximum width for badge text in pixels.
   * Text will be truncated if it exceeds this width.
   */
  maxWidth?: number;

  /**
   * Additional CSS classes to apply to badges for width measurement.
   */
  className?: string;

  /**
   * Container padding in pixels.
   *
   * @default 16
   */
  containerPadding?: number;

  /**
   * Gap between badges in pixels.
   *
   * @default 4
   */
  badgeGap?: number;

  /**
   * Approximate width of the overflow badge ("+N") in pixels.
   *
   * @default 40
   */
  overflowBadgeWidth?: number;

  /**
   * Render function for each badge item.
   *
   * @example
   * renderBadge={(item, label) => <Badge>{label}</Badge>}
   */
  renderBadge: (item: T, label: string) => React.ReactNode;

  /**
   * Render function for the overflow indicator badge.
   *
   * @example
   * renderOverflow={(count) => <Badge>+{count}</Badge>}
   */
  renderOverflow?: (count: number) => React.ReactNode;
}
