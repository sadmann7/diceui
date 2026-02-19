import type { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card";
import type * as React from "react";

export interface RelativeTimeCardProps
  extends PreviewCardPrimitive.Root.Props,
    Omit<
      PreviewCardPrimitive.Trigger.Props,
      keyof React.ComponentProps<"button">
    >,
    Pick<
      PreviewCardPrimitive.Positioner.Props,
      "align" | "side" | "alignOffset" | "sideOffset"
    > {
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
  variant?: "default" | "muted" | "ghost";

  /**
   * How long to wait before the hover card opens.
   *
   * Specified in milliseconds.
   *
   * @default 500
   */
  delay?: PreviewCardPrimitive.Trigger.Props["delay"];

  /**
   * How long to wait before closing the hover card.
   *
   * Specified in milliseconds.
   *
   * @default 300
   */
  closeDelay?: PreviewCardPrimitive.Trigger.Props["closeDelay"];

  /**
   * Allows you to replace the trigger's HTML element with a different tag,
   * or compose it with another component.
   *
   * Accepts a `ReactElement` or a function that returns the element to render.
   *
   * ```tsx
   * <RelativeTimeCard render={<Button variant="outline" />} />
   * ```
   */
  render?: PreviewCardPrimitive.Trigger.Props["render"];

  /**
   * Additional CSS classes for the trigger element.
   */
  className?: string;

  /**
   * Custom content for the trigger. Defaults to a formatted date/time string.
   */
  children?: React.ReactNode;
}
