import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import { Slot as SlotPrimitive } from "radix-ui";

const statusVariants = cva("cn-status", {
  variants: {
    variant: {
      default: "cn-status-variant-default",
      success: "cn-status-variant-success",
      error: "cn-status-variant-error",
      warning: "cn-status-variant-warning",
      info: "cn-status-variant-info",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface StatusProps
  extends VariantProps<typeof statusVariants>, React.ComponentProps<"div"> {
  asChild?: boolean;
}

function Status(props: StatusProps) {
  const { className, variant = "default", asChild, ...rootProps } = props;

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RootPrimitive
      data-slot="status"
      data-variant={variant}
      {...rootProps}
      className={cn(statusVariants({ variant }), className)}
    />
  );
}

function StatusIndicator(props: React.ComponentProps<"div">) {
  const { className, ...indicatorProps } = props;

  return (
    <div
      data-slot="status-indicator"
      {...indicatorProps}
      className={cn("cn-status-indicator", className)}
    />
  );
}

function StatusLabel(props: React.ComponentProps<"div">) {
  const { className, ...labelProps } = props;

  return (
    <div
      data-slot="status-label"
      {...labelProps}
      className={cn("cn-status-label", className)}
    />
  );
}

export { Status, StatusIndicator, StatusLabel, statusVariants };
