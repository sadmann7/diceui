import type { useRender } from "@base-ui/react/use-render";
import type { EmptyProps } from "@/types";

export interface StatusProps
  extends Omit<EmptyProps<"div">, "color">,
    useRender.ComponentProps<"div"> {
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
