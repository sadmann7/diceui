import type * as React from "react";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

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
  extends
    VariantProps<typeof statusVariants>,
    React.ComponentProps<"div">,
    useRender.ComponentProps<"div"> {}

function Status(props: StatusProps) {
  const { className, variant = "default", render, ...rootProps } = props;

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(statusVariants({ variant }), className),
      },
      rootProps,
    ),
    render,
    state: {
      slot: "status",
      variant,
    },
  });
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
