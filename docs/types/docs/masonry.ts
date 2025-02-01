import type { SlotProps } from "@radix-ui/react-slot";

interface ResponsiveObject {
  /** Value for initial breakpoint (0px). */
  initial?: number;
  /** Value for sm breakpoint (640px). */
  sm?: number;
  /** Value for md breakpoint (768px). */
  md?: number;
  /** Value for lg breakpoint (1024px). */
  lg?: number;
  /** Value for xl breakpoint (1280px). */
  xl?: number;
  /** Value for 2xl breakpoint (1536px). */
  "2xl"?: number;
}

export interface RootProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * The number of columns to display.
   *
   * Can be a fixed number or a responsive object.
   *
   * ```ts
   * // Fixed number
   * columnCount={3}
   * // Responsive object
   * columnCount={{ initial: 2, sm: 3, md: 4, lg: 5 }}
   * ```
   * @default 4
   */
  columnCount?: number | ResponsiveObject;

  /**
   * The default number of columns to display during SSR and before hydration.
   *
   * This value will be used before the component is mounted.
   *
   * ```ts
   * defaultColumnCount={2} // matches columnCount={{ initial: 2, sm: 3, md: 4 }}
   * ```
   * @default 4
   */
  defaultColumnCount?: number;

  /**
   * The gap between items.
   * Can be a fixed number or a responsive object.
   *
   * ```ts
   * // Fixed number
   * gap={24}
   * // Responsive object
   * gap={{ initial: 16, sm: 20, md: 24, lg: 32 }}
   * ```
   * @default 16
   */
  gap?: number | ResponsiveObject;

  /**
   * The default gap between items during SSR and before hydration.
   *
   * This value will be used before the component is mounted.
   *
   * ```ts
   * defaultGap={16} // matches gap={{ initial: 16, sm: 20, md: 24 }}
   * ```
   * @default 16
   */
  defaultGap?: number;

  /**
   * Whether to use linear layout instead of optimal layout.
   *
   * Linear layout places items in order from left to right.
   * @default false
   */
  linear?: boolean;

  /**
   * Merges the root's props into its immediate child.
   * @default false
   */
  asChild?: boolean;
}

export interface ItemProps
  extends Omit<SlotProps, keyof React.ComponentPropsWithoutRef<"div">> {
  /**
   * Merges the item's props into its immediate child.
   * @default false
   */
  asChild?: boolean;

  /**
   * Fallback content to show when the masonry is not mounted for server-side rendering.
   *
   * ```ts
   * fallback={<Skeleton className="w-full" style={{ height: 160 }} />}
   * ```
   */
  fallback?: React.ReactNode;
}
