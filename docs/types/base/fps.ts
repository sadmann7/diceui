import type { EmptyProps } from "@/types";

export interface FpsProps extends EmptyProps<"div"> {
  /**
   * Positioning strategy for the FPS counter.
   * - `fixed`: Positioned relative to the viewport, rendered via portal.
   * - `absolute`: Positioned relative to the nearest positioned ancestor, rendered inline.
   *
   * @default "fixed"
   */
  strategy?: "fixed" | "absolute";

  /**
   * Position of the FPS counter.
   *
   * @default "top-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

  /**
   * Custom label text displayed before the FPS value.
   * If not provided, only the FPS number is shown.
   *
   * ```tsx
   * label="FPS"
   * ```
   */
  label?: string;

  /**
   * How often to update the FPS display (in milliseconds).
   *
   * @default 500
   */
  updateInterval?: number;

  /**
   * Threshold for warning color (FPS below this will show warning).
   *
   * @default 30
   */
  warningThreshold?: number;

  /**
   * Threshold for error color (FPS below this will show error).
   *
   * @default 20
   */
  errorThreshold?: number;

  /**
   * The container to mount the portal into.
   * When `strategy` is `"absolute"`, this prop is ignored.
   *
   * ```tsx
   * portalContainer={containerRef.current}
   * ```
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;

  /**
   * Whether the FPS counter is enabled.
   *
   * @default true
   */
  enabled?: boolean;
}
