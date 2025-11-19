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
   * Function to extract the label string from each badge item.
   *
   * Optional for primitive arrays (strings, numbers).
   * Required for object arrays.
   *
   * ```tsx
   * // For primitive arrays, getBadgeLabel is optional
   * <BadgeOverflow items={["React", "TypeScript"]} />
   * ```
   *
   * ```tsx
   * // For object arrays, getBadgeLabel is required
   * <BadgeOverflow items={[{ id: 1, name: "React" }]} getBadgeLabel={(item) => item.name} />
   * ```
   */
  getBadgeLabel?: (item: T) => string;

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
   * Container padding in pixels.
   *
   * @default 16
   */
  containerPadding?: number;

  /**
   * Size of icon in pixels if badges contain icons.
   */
  badgeIconSize?: number;

  /**
   * Maximum width for badge text in pixels.
   * Text will be truncated if it exceeds this width.
   */
  badgeMaxWidth?: number;

  /**
   * Height of a single badge in pixels.
   * Used to calculate placeholder height based on lineCount.
   *
   * @default 20
   */
  badgeHeight?: number;

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
