import type { CompositionProps, EmptyProps } from "@/types";

type Side = "left" | "right" | "top" | "bottom";

export interface MarqueeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The direction of the marquee animation.
   * @default "left"
   */
  side?: Side;

  /**
   * The speed of the animation in pixels per second.
   * @default 50
   */
  speed?: number;

  /**
   * Number of animation iterations.
   * - `0` (default): Infinite loop
   * - `Infinity`: Infinite loop
   * - `> 0`: Loop the specified number of times then stop
   * @default 0
   */
  loopCount?: number;

  /**
   * The gap between marquee items. Accepts CSS length values or numbers (in pixels).
   *
   * ```tsx
   * // String values (CSS units)
   * <Marquee gap="20px" />
   * <Marquee gap="1.5rem" />
   * <Marquee gap="2em" />
   *
   * // Number values (in pixels)
   * <Marquee gap={16} />
   * ```
   *
   * @default "1rem"
   */
  gap?: string | number;

  /**
   * Automatically duplicate content to fill the container width/height.
   * When enabled, content will be repeated until it fills the visible area.
   * @default false
   */
  autoFill?: boolean;

  /**
   * Whether to pause the animation on hover.
   * @default false
   */
  pauseOnHover?: boolean;

  /**
   * Whether to reverse the animation direction.
   * @default false
   */
  reverse?: boolean;
}

export interface MarqueeContentProps
  extends EmptyProps<"div">,
    CompositionProps {}

export interface MarqueeItemProps extends EmptyProps<"div">, CompositionProps {}

export interface MarqueeEdgeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Which side to apply the edge gradient effect.
   * @example
   * ```tsx
   * <MarqueeEdge side="left" />
   * <MarqueeEdge side="right" />
   * ```
   */
  side: Side;
}
