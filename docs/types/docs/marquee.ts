import type { CompositionProps, EmptyProps } from "@/types";

export interface MarqueeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The direction of the marquee animation.
   * @default "left"
   */
  direction?: "left" | "right" | "up" | "down";

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

  /**
   * The speed of the animation in pixels per second.
   * @default 50
   */
  speed?: number;

  /**
   * The number of content loops for seamless scrolling.
   * @default 2
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
}

export interface MarqueeContentProps
  extends EmptyProps<"div">,
    CompositionProps {
  // No additional props - inherits from base props
}

export interface MarqueeItemProps extends EmptyProps<"div">, CompositionProps {
  // No additional props - inherits from base props
}

export interface MarqueeFadeProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Which side to apply the fade effect.
   * @example
   * ```tsx
   * <MarqueeFade side="left" />
   * <MarqueeFade side="right" />
   * ```
   */
  side: "left" | "right" | "top" | "bottom";
}
