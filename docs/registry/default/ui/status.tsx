import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface DivProps extends React.ComponentProps<"div"> {}

const statusVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full border px-2.5 py-1 font-medium text-xs transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-muted text-muted-foreground **:data-[slot=status-indicator]:bg-muted-foreground",
        success:
          "border-green-500/20 bg-green-500/10 text-green-600 **:data-[slot=status-indicator]:bg-green-600 dark:text-green-400 **:data-[slot=status-indicator]:dark:bg-green-400",
        error:
          "border-destructive/20 bg-destructive/10 text-destructive **:data-[slot=status-indicator]:bg-destructive",
        warning:
          "border-orange-500/20 bg-orange-500/10 text-orange-600 **:data-[slot=status-indicator]:bg-orange-600 dark:text-orange-400 **:data-[slot=status-indicator]:dark:bg-orange-400",
        info: "border-blue-500/20 bg-blue-500/10 text-blue-600 **:data-[slot=status-indicator]:bg-blue-600 dark:text-blue-400 **:data-[slot=status-indicator]:dark:bg-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface StatusProps extends VariantProps<typeof statusVariants>, DivProps {
  asChild?: boolean;
}

function Status(props: StatusProps) {
  const { className, variant = "default", asChild, ...rootProps } = props;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RootPrimitive
      data-slot="status"
      data-variant={variant}
      {...rootProps}
      className={cn(statusVariants({ variant }), className)}
    />
  );
}

function StatusIndicator(props: DivProps) {
  const { className, ...indicatorProps } = props;

  return (
    <div
      data-slot="status-indicator"
      {...indicatorProps}
      className={cn(
        "relative flex size-2 shrink-0 rounded-full",
        "before:absolute before:inset-0 before:animate-ping before:rounded-full before:bg-inherit",
        "after:absolute after:inset-[2px] after:rounded-full after:bg-inherit",
        className,
      )}
    />
  );
}

function StatusLabel(props: DivProps) {
  const { className, ...labelProps } = props;

  return (
    <div
      data-slot="status-label"
      {...labelProps}
      className={cn("leading-none", className)}
    />
  );
}

export {
  Status,
  StatusIndicator,
  StatusLabel,
  //
  statusVariants,
};
