import type { EmptyProps } from "@/types";

export interface FpsProps extends EmptyProps<"div"> {
  /**
   * Custom label text.
   * @default "FPS"
   */
  label?: string;

  /**
   * Whether the FPS counter is enabled.
   * @default true
   */
  enabled?: boolean;

  /**
   * How often to update the FPS display (in milliseconds).
   * @default 500
   */
  updateInterval?: number;

  /**
   * Position of the FPS counter.
   * @default "top-right"
   */
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";

  /**
   * Threshold for warning color (FPS below this will show warning).
   * @default 30
   */
  warningThreshold?: number;

  /**
   * Threshold for error color (FPS below this will show error).
   * @default 20
   */
  errorThreshold?: number;

  /**
   * The container to mount the portal into.
   * @default document.body
   */
  portalContainer?: Element | DocumentFragment | null;
}
