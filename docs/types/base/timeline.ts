import type { useRender } from "@base-ui/react/use-render";
import type { Direction, EmptyProps, Orientation } from "@/types";

export interface TimelineProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {
  /**
   * The orientation of the timeline.
   *
   * @default "vertical"
   */
  orientation?: Orientation;

  /**
   * The visual variant of the timeline.
   *
   * - "default": The timeline items are displayed in a single line/stack.
   * - "alternate": The timeline items alternate on both sides of the timeline (left/right for vertical, above/below for horizontal).
   *
   * @default "default"
   */
  variant?: "default" | "alternate";

  /**
   * The reading direction of the timeline.
   * This affects the layout direction and works with RTL languages.
   *
   * @default "ltr"
   */
  dir?: Direction;

  /**
   * The zero-based index of the active item in the timeline.
   * When set, items before this index will be marked as "completed",
   * the item at this index will be "active", and items after will be "pending".
   *
   * ```ts
   * // Mark up to 2 items as "completed", and the item at index 2 as "active".
   * activeIndex={2}
   * ```
   *
   */
  activeIndex?: number;
}

export interface TimelineItemProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineHeaderProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineTitleProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineDescriptionProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineContentProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineTimeProps
  extends EmptyProps<"time">,
    useRender.ComponentProps<"time"> {
  /**
   * The datetime attribute for the time element.
   *
   * ```ts
   * dateTime="2025-11-22"
   * ```
   */
  dateTime?: string;
}

export interface TimelineDotProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {}

export interface TimelineConnectorProps
  extends EmptyProps<"div">,
    useRender.ComponentProps<"div"> {
  /**
   * When `true`, forces the connector to be rendered even if it's the last item.
   * Useful for controlling animations with external animation libraries.
   *
   * @default false
   */
  forceMount?: boolean;
}
