import type { EmptyProps, RenderProps } from "@/types";

export interface StatusProps extends RenderProps {
  /**
   * The visual style and color theme of the status badge.
   *
   * - `"default"`: Neutral muted gray styling
   * - `"success"`: Green styling for online/active states
   * - `"error"`: Red styling for offline/error states
   * - `"warning"`: Orange styling for away/warning states
   * - `"info"`: Blue styling for idle/informational states
   *
   * ```tsx
   * <Status variant="success">
   *   <StatusIndicator />
   *   <StatusLabel>Online</StatusLabel>
   * </Status>
   * ```
   *
   * @default "default"
   */
  variant?: "default" | "success" | "error" | "warning" | "info";
}

export interface StatusIndicatorProps extends EmptyProps<"div"> {}

export interface StatusLabelProps extends EmptyProps<"div"> {}
