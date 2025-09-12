"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const stackVariants = cva("flex items-center", {
  variants: {
    orientation: {
      horizontal: "-space-x-1 flex-row",
      vertical: "-space-y-1 flex-col",
    },
    reverse: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      reverse: true,
      className: "flex-row-reverse",
    },
    {
      orientation: "vertical",
      reverse: true,
      className: "flex-col-reverse",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    reverse: false,
  },
});

interface StackProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof stackVariants> {
  size?: number;
  asChild?: boolean;
}

function Stack(props: StackProps) {
  const {
    orientation = "horizontal",
    size = 40,
    asChild,
    reverse,
    className,
    children,
    ...rootProps
  } = props;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RootPrimitive
      data-orientation={orientation}
      data-slot="stack"
      {...rootProps}
      className={cn(stackVariants({ orientation, reverse }), className)}
    >
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;

        return (
          <StackItem
            key={index}
            child={child}
            index={index}
            size={size}
            orientation={orientation}
          />
        );
      })}
    </RootPrimitive>
  );
}

interface StackItemProps
  extends React.ComponentProps<"div">,
    Pick<StackProps, "orientation"> {
  child: React.ReactElement;
  index: number;
  size: number;
}

function StackItem(props: StackItemProps) {
  const {
    child,
    index,
    size,
    orientation,
    style: styleProp,
    className,
    ...itemProps
  } = props;

  const style = React.useMemo(() => {
    let maskImage = "";
    if (index > 0) {
      const maskRadius = size / 2;
      const maskOffset = size / 4 + size / 10;

      if (orientation === "vertical") {
        maskImage = `radial-gradient(circle ${maskRadius}px at 50% -${maskOffset}px, transparent 99%, white 100%)`;
      } else {
        maskImage = `radial-gradient(circle ${maskRadius}px at -${maskOffset}px 50%, transparent 99%, white 100%)`;
      }
    }

    return {
      width: size,
      height: size,
      maskImage,
      ...styleProp,
    };
  }, [size, index, orientation, styleProp]);

  return (
    <Slot
      data-slot="stack-item"
      className={cn(
        "size-full shrink-0 overflow-hidden rounded-full",
        className,
      )}
      style={style}
      {...itemProps}
    >
      {child}
    </Slot>
  );
}

export { Stack };
