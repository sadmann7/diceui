import type * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const demoVariants = cva(
  "mx-auto grid w-full grid-cols-1 place-items-center gap-4",
  {
    variants: {
      size: {
        sm: "max-w-lg",
        default: "max-w-3xl",
        lg: "max-w-5xl",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

function Demo({
  size = "default",
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof demoVariants>) {
  return (
    <div
      data-slot="demo"
      data-size={size}
      className={cn(demoVariants({ size }), className)}
      {...props}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <DemoItem key={child.key ?? index}>{child}</DemoItem>
        ))
      ) : (
        <DemoItem>{children}</DemoItem>
      )}
    </div>
  );
}

function DemoItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="demo-item"
      className={cn(
        "grid min-h-[calc(100svh-10rem)] w-full grid-cols-1 place-items-center",
        className,
      )}
      {...props}
    />
  );
}

function DemoItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="demo-item-group"
      className={cn("flex w-full flex-col items-center gap-4", className)}
      {...props}
    />
  );
}

export { Demo, DemoItemGroup };
