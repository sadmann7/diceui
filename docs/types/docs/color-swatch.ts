import type * as React from "react";
import type { CompositionProps, EmptyProps } from "@/types";

/**
 * Props for the ColorSwatch component.
 *
 * @example
 * ```tsx
 * <ColorSwatch value="#ff0000" />
 * ```
 */
export interface ColorSwatchProps extends EmptyProps<"div">, CompositionProps {
  /**
   * The color value to display. Can be any valid CSS color value.
   * @default undefined
   * @example "#ff0000" | "rgb(255, 0, 0)" | "hsl(0, 100%, 50%)" | "rgba(255, 0, 0, 0.5)"
   */
  value?: string;

  /**
   * The size of the color swatch.
   * @default "default"
   */
  size?: "default" | "sm" | "lg";

  /**
   * Whether to hide the checkerboard pattern for transparent colors.
   * @default false
   */
  withoutTransparency?: boolean;

  /**
   * Whether the color swatch is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * Render as a child component.
   * @default false
   */
  asChild?: boolean;
}
