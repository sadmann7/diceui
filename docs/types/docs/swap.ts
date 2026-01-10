import type { CompositionProps, EmptyProps } from "@/types";

export interface SwapProps extends EmptyProps<"div">, CompositionProps {
  /**
   * Whether the swap is in the swapped state (controlled).
   */
  swapped?: boolean;

  /**
   * Whether the swap is initially in the swapped state.
   * @default false
   */
  defaultSwapped?: boolean;

  /**
   * Callback when the swapped state changes.
   */
  onSwappedChange?: (swapped: boolean) => void;

  /**
   * The activation mode for triggering the swap.
   *
   * - `click`: Clicking the swap component will toggle the swapped state.
   * - `hover`: Hovering over the swap component will show the swapped state.
   *
   * @default "click"
   */
  activationMode?: "click" | "hover";

  /**
   * The animation type for the swap transition.
   *
   * - `fade`: Simple opacity transition
   * - `rotate`: Rotates 180 degrees
   * - `flip`: 3D flip effect on y-axis
   * - `scale`: Scales from/to 0
   *
   * @default "fade"
   */
  animation?: "fade" | "rotate" | "flip" | "scale";

  /**
   * Whether the swap is disabled.
   * @default false
   */
  disabled?: boolean;
}

export interface SwapOnProps extends EmptyProps<"div">, CompositionProps {}

export interface SwapOffProps extends EmptyProps<"div">, CompositionProps {}
