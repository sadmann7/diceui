"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

const stackVariants = cva("flex", {
  variants: {
    direction: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    align: {
      start: "",
      center: "",
      end: "",
    },
    spacing: {
      xs: "gap-1",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    },
    overlap: {
      true: "",
      false: "",
    },
    reverse: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    // alignment
    {
      direction: "horizontal",
      align: "start",
      className: "items-start",
    },
    {
      direction: "horizontal",
      align: "center",
      className: "items-center",
    },
    {
      direction: "horizontal",
      align: "end",
      className: "items-end",
    },
    {
      direction: "vertical",
      align: "start",
      className: "justify-start",
    },
    {
      direction: "vertical",
      align: "center",
      className: "justify-center",
    },
    {
      direction: "vertical",
      align: "end",
      className: "justify-end",
    },
    {
      direction: "horizontal",
      reverse: true,
      className: "flex-row-reverse",
    },
    {
      direction: "vertical",
      reverse: true,
      className: "flex-col-reverse",
    },
    {
      direction: "horizontal",
      overlap: true,
      spacing: "xs",
      className: "-space-x-1",
    },
    {
      direction: "horizontal",
      overlap: true,
      spacing: "sm",
      className: "-space-x-2",
    },
    {
      direction: "horizontal",
      overlap: true,
      spacing: "md",
      className: "-space-x-3",
    },
    {
      direction: "horizontal",
      overlap: true,
      spacing: "lg",
      className: "-space-x-4",
    },
    {
      direction: "horizontal",
      overlap: true,
      spacing: "xl",
      className: "-space-x-6",
    },
    {
      direction: "vertical",
      overlap: true,
      spacing: "xs",
      className: "-space-y-1",
    },
    {
      direction: "vertical",
      overlap: true,
      spacing: "sm",
      className: "-space-y-2",
    },
    {
      direction: "vertical",
      overlap: true,
      spacing: "md",
      className: "-space-y-3",
    },
    {
      direction: "vertical",
      overlap: true,
      spacing: "lg",
      className: "-space-y-4",
    },
    {
      direction: "vertical",
      overlap: true,
      spacing: "xl",
      className: "-space-y-6",
    },
    {
      direction: "horizontal",
      reverse: true,
      overlap: true,
      className: "space-x-reverse",
    },
    {
      direction: "vertical",
      reverse: true,
      overlap: true,
      className: "space-y-reverse",
    },
    {
      overlap: true,
      className: "gap-0",
    },
  ],
  defaultVariants: {
    direction: "horizontal",
    align: "center",
    spacing: "sm",
    overlap: false,
    reverse: false,
  },
});

function StackRoot(props: DivProps & VariantProps<typeof stackVariants>) {
  const {
    direction,
    align,
    spacing,
    overlap,
    reverse,
    asChild,
    className,
    ...rootProps
  } = props;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RootPrimitive
      data-direction={direction}
      data-overlap={overlap ? "" : undefined}
      data-slot="stack"
      {...rootProps}
      className={cn(
        stackVariants({ direction, align, spacing, overlap, reverse }),
        className,
      )}
    />
  );
}

function StackItem(props: DivProps) {
  const { asChild, className, children, ...itemProps } = props;

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      data-slot="stack-item"
      {...itemProps}
      className={cn("relative shrink-0 [&:not(:first-child)]:z-[1]", className)}
    >
      {children}
    </ItemPrimitive>
  );
}

export {
  StackRoot as Root,
  StackItem as Item,
  //
  StackRoot as Stack,
  StackItem,
};
