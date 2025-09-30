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
   * The gap between marquee items in css length value (px, rem, em, etc.).
   *
   * ```tsx
   * // Pixel values
   * <Marquee gap="20px" />
   *
   * // Rem values
   * <Marquee gap="1.5rem" />
   * ```
   *
   * @default "1rem"
   */
  gap?: string;

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

export interface MarqueeFadeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Which side to apply the fade effect.
   * @example
   * ```tsx
   * <MarqueeFade side="left" />
   * <MarqueeFade side="right" />
   * ```
   */
  side: Side;
}
