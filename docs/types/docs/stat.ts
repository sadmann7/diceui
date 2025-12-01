import type { Separator } from "@radix-ui/react-separator";
import type { CompositionProps, EmptyProps } from "@/types";

export interface StatProps extends EmptyProps<"div">, CompositionProps {}

export interface StatLabelProps extends EmptyProps<"div">, CompositionProps {}

export interface StatIndicatorProps extends Omit<EmptyProps<"div">, "color"> {
  /**
   * The visual style of the indicator.
   *
   * - `"default"`: Simple icon without background
   * - `"icon"`: Icon with bordered container
   * - `"badge"`: Compact badge style with number or icon
   * - `"action"`: Interactive button style with hover effects
   *
   * ```tsx
   * <Stat.Indicator variant="icon" color="success">
   *   <DollarSign />
   * </Stat.Indicator>
   * ```
   *
   * @default "default"
   */
  variant?: "default" | "icon" | "badge" | "action";

  /**
   * The color theme of the indicator.
   *
   * - `"default"`: Muted gray background
   * - `"success"`: Green background for positive metrics
   * - `"info"`: Blue background for informational metrics
   * - `"warning"`: Orange background for warning metrics
   * - `"error"`: Red background for error or critical metrics
   *
   * ```tsx
   * <Stat.Indicator variant="badge" color="success">
   *   +24
   * </Stat.Indicator>
   * ```
   *
   * @default "default"
   */
  color?: "default" | "success" | "info" | "warning" | "error";
}

export interface StatValueProps extends EmptyProps<"div"> {}

export interface StatTrendProps extends EmptyProps<"div"> {
  /**
   * The trend direction to display with appropriate styling.
   *
   * - `"up"`: Shows positive trend with green color
   * - `"down"`: Shows negative trend with red color
   * - `"neutral"`: Shows neutral trend with muted color
   *
   * ```tsx
   * <Stat.Trend trend="up">
   *   <ArrowUp />
   *   +20.1% from last month
   * </Stat.Trend>
   * ```
   */
  trend?: "up" | "down" | "neutral";
}

export interface StatSeparatorProps extends EmptyProps<typeof Separator> {}

export interface StatDescriptionProps extends EmptyProps<"div"> {}
