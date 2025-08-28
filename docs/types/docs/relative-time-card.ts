import type {
  HoverCardContentProps,
  HoverCardProps,
} from "@radix-ui/react-hover-card";
import type { CompositionProps, EmptyProps } from "@/types";

export interface RelativeTimeCardProps
  extends EmptyProps<"button">,
    CompositionProps {
  /**
   * The date to display. Can be a Date object, string, or number.
   *
   * ```tsx
   * <RelativeTimeCard date={new Date()} />
   * <RelativeTimeCard date="2024-03-20T10:30:00Z" />
   * ```
   */
  date: Date | string | number;

  /**
   * List of timezones to display in the hover card.
   *
   * ```tsx
   * <RelativeTimeCard date={new Date()} timezones={["UTC", "America/New_York", "Europe/London"]} />
   * ```
   *
   * @default ["UTC"]
   */
  timezones?: string[];

  /**
   * Interval in milliseconds to update the relative time display.
   * @default 1000
   */
  updateInterval?: number;

  /**
   * The visual style of the trigger element.
   * @default "default"
   */
  variant?: "default" | "subtle" | "ghost";

  /**
   * Whether the hover card is open.
   * @default false
   */
  open?: HoverCardProps["open"];

  /**
   * Whether the hover card is open by default.
   * @default false
   */
  defaultOpen?: HoverCardProps["defaultOpen"];

  /**
   * The callback function that is called when the open state of the hover card changes.
   */
  onOpenChange?: HoverCardProps["onOpenChange"];

  /**
   * The delay in milliseconds before the hover card opens.
   * @default 500
   */
  openDelay?: HoverCardProps["openDelay"];

  /**
   * The delay in milliseconds before the hover card closes.
   * @default 300
   */
  closeDelay?: HoverCardProps["closeDelay"];

  /**
   * The preferred side of the trigger to render against when open.
   *
   * Will be reversed when collisions occur and avoidCollisions is enabled.
   *
   * @default "bottom"
   */
  side?: HoverCardContentProps["side"];

  /**
   * The distance in pixels from the trigger.
   * @default 0
   */
  sideOffset?: HoverCardContentProps["sideOffset"];

  /**
  /**
   * The preferred alignment against the trigger. May change when collisions occur.
   *
   * @default "center"
   */
  align?: HoverCardContentProps["align"];

  /**
   * An offset in pixels from the "start" or "end" alignment options.
   * @default 0
   */
  alignOffset?: HoverCardContentProps["alignOffset"];

  /**
   * Whether to avoid collisions with boundary edges.
   * @default true
   */
  avoidCollisions?: HoverCardContentProps["avoidCollisions"];

  /**
   * The element used as the collision boundary. By default this is the viewport,
   * though you can provide additional element(s) to be included in this check.
   * @default []
   */
  collisionBoundary?: HoverCardContentProps["collisionBoundary"];

  /**
   * The distance in pixels from the boundary edges where collision detection should occur.
   *
   * Can be a single number or an object with specific padding values.
   * @default 0
   */
  collisionPadding?: HoverCardContentProps["collisionPadding"];
}
