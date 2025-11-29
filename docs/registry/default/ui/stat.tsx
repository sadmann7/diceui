import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Stat({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat"
      className={cn(
        "grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg border bg-card p-4 text-card-foreground shadow-sm",
        "**:data-[slot=stat-label]:col-span-1",
        "**:data-[slot=stat-value]:col-span-1",
        "**:data-[slot=stat-icon]:col-start-2 **:data-[slot=stat-icon]:row-span-2 **:data-[slot=stat-icon]:row-start-1 **:data-[slot=stat-icon]:self-start",
        "**:data-[slot=stat-change]:col-span-2",
        "**:data-[slot=stat-description]:col-span-2",
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

function StatValue({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stat-value"
      className={cn("font-semibold text-2xl tracking-tight", className)}
      {...props}
    />
  );
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

function StatChange({
  className,
  trend,
  ...props
}: React.ComponentProps<"div"> & { trend?: "up" | "down" | "neutral" }) {
  return (
    <div
      data-slot="stat-change"
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

const statIconVariants = cva(
  "flex shrink-0 items-center justify-center [&_svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "text-muted-foreground",
        box: "size-9 rounded-md border [&_svg:not([class*='size-'])]:size-4",
      },
      color: {
        default: "bg-muted text-muted-foreground",
        primary: "border-primary/20 bg-primary/10 text-primary",
        blue: "border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400",
        green:
          "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
        orange:
          "border-orange-500/20 bg-orange-500/10 text-orange-600 dark:text-orange-400",
        red: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        purple:
          "border-purple-500/20 bg-purple-500/10 text-purple-600 dark:text-purple-400",
        yellow:
          "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "default",
    },
  },
);

function StatIcon({
  className,
  variant = "default",
  color = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof statIconVariants>) {
  return (
    <div
      data-slot="stat-icon"
      data-variant={variant}
      data-color={color}
      className={cn(statIconVariants({ variant, color, className }))}
      {...props}
    />
  );
}

export { Stat, StatLabel, StatValue, StatDescription, StatChange, StatIcon };
