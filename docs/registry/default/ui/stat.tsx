import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat"
      className={cn(
        "grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        "**:data-[slot=stat-label]:col-span-1 **:data-[slot=stat-value]:col-span-1",
        "**:data-[slot=stat-indicator]:col-start-2 **:data-[slot=stat-indicator]:row-span-2 **:data-[slot=stat-indicator]:row-start-1 **:data-[slot=stat-indicator]:self-start",
        "**:data-[slot=stat-description]:col-span-2 **:data-[slot=stat-separator]:col-span-2 **:data-[slot=stat-trend]:col-span-2",
        className,
      )}
      {...props}
    />
  );
}

function StatLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-label"
      className={cn("font-medium text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

const statIndicatorVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "text-muted-foreground [&_svg:not([class*='size-'])]:size-5",
        icon: "size-8 rounded-md border [&_svg:not([class*='size-'])]:size-3.5",
        badge:
          "h-6 min-w-6 rounded-sm border px-1.5 font-medium text-xs [&_svg:not([class*='size-'])]:size-3",
        action:
          "size-8 cursor-pointer rounded-md transition-colors hover:bg-muted/50 [&_svg:not([class*='size-'])]:size-4",
      },
      color: {
        default: "bg-muted text-muted-foreground",
        success:
          "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        warning:
          "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        error: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
    },
  },
);

interface StatIndicatorProps
  extends Omit<React.ComponentProps<"div">, "color">,
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
      className={cn("font-semibold text-2xl tracking-tight", className)}
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
        "inline-flex items-center gap-1 font-medium text-xs [&_svg:not([class*='size-'])]:size-3 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
  return <Separator data-slot="stat-separator" className="my-2" {...props} />;
}

function StatDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

export {
  Stat,
  StatLabel,
  StatIndicator,
  StatValue,
  StatTrend,
  StatSeparator,
  StatDescription,
};
