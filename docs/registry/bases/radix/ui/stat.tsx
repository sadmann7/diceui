import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

import { Separator } from "@/registry/bases/radix/ui/separator";

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div data-slot="stat" className={cn("cn-stat", className)} {...props} />
  );
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-label"
      className={cn("cn-stat-label", className)}
      {...props}
    />
  );
}

const statIndicatorVariants = cva("cn-stat-indicator", {
  variants: {
    variant: {
      default: "cn-stat-indicator-variant-default",
      icon: "cn-stat-indicator-variant-icon",
      badge: "cn-stat-indicator-variant-badge",
      action: "cn-stat-indicator-variant-action",
    },
    color: {
      default: "cn-stat-indicator-color-default",
      success: "cn-stat-indicator-color-success",
      info: "cn-stat-indicator-color-info",
      warning: "cn-stat-indicator-color-warning",
      error: "cn-stat-indicator-color-error",
    },
  },
  defaultVariants: {
    variant: "default",
    color: "default",
  },
});

interface StatIndicatorProps
  extends
    Omit<React.ComponentProps<"div">, "color">,
    VariantProps<typeof statIndicatorVariants> {}

function StatIndicator({
  className,
  variant = "default",
  color = "default",
  ...props
}: StatIndicatorProps) {
  return (
    <div
      data-slot="stat-indicator"
      data-variant={variant}
      data-color={color}
      className={cn(statIndicatorVariants({ variant, color, className }))}
      {...props}
    />
  );
}

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-value"
      className={cn("cn-stat-value", className)}
      {...props}
    />
  );
}

function StatTrend({
  className,
  trend,
  ...props
}: React.ComponentProps<"div"> & { trend?: "up" | "down" | "neutral" }) {
  return (
    <div
      data-slot="stat-trend"
      data-trend={trend}
      className={cn(
        "cn-stat-trend",
        {
          "text-green-600 dark:text-green-400": trend === "up",
          "text-red-600 dark:text-red-400": trend === "down",
          "text-muted-foreground": trend === "neutral" || !trend,
        },
        className,
      )}
      {...props}
    />
  );
}

function StatSeparator({ ...props }: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="stat-separator"
      className="cn-stat-separator"
      {...props}
    />
  );
}

function StatDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-description"
      className={cn("cn-stat-description", className)}
      {...props}
    />
  );
}

export {
  Stat,
  StatDescription,
  StatIndicator,
  StatLabel,
  StatSeparator,
  StatTrend,
  StatValue,
};
