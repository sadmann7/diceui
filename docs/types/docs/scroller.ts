import type { CompositionProps, EmptyProps } from "@/types";

export interface ScrollerProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The scroll direction of the container.
   * @default "vertical"
   */
  orientation?: "vertical" | "horizontal";

  /**
   * Whether to hide the scrollbar.
   * @default false
   */
  hideScrollbar?: boolean;

  /**
   * Size of the scroll shadow in pixels.
   * @default 40
   */
  size?: number;

  /**
   * Offset for scroll shadow visibility.
   * @default 0
   */
  offset?: number;

  /**
   * Whether to show navigation buttons.
   * @default false
   */
  withNavigation?: boolean;

  /**
   * Amount to scroll when using navigation buttons.
   *
   * When `withNavigation` is false, this prop is ignored.
   * @default 40
   */
  scrollStep?: number;

  /**
   * How navigation buttons trigger scrolling.
   * - `press`: Continuous scrolling while button is pressed
   * - `hover`: Continuous scrolling while hovering
   * - `click`: Single scroll step per click
   *
   * When `withNavigation` is false, this prop is ignored.
   * @default "press"
   */
  scrollTriggerMode?: "press" | "hover" | "click";
}
