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
  max?: number;
  asChild?: boolean;
}

function Stack(props: StackProps) {
  const {
    orientation = "horizontal",
    size = 40,
    max,
    asChild,
    reverse,
    className,
    children,
    ...rootProps
  } = props;

  const childrenArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const totalItems = childrenArray.length;
  const shouldTruncate = max && totalItems > max;
  const visibleItems = shouldTruncate
    ? childrenArray.slice(0, max - 1)
    : childrenArray;
  const overflowCount = shouldTruncate ? totalItems - (max - 1) : 0;

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <RootPrimitive
      data-orientation={orientation}
      data-slot="stack"
      {...rootProps}
      className={cn(stackVariants({ orientation, reverse }), className)}
    >
      {visibleItems.map((child, index: number) => (
        <StackItem
          key={index}
          child={child}
          index={index}
          size={size}
          orientation={orientation}
        />
      ))}
      {shouldTruncate && (
        <StackItem
          key="overflow"
          child={
            <div className="flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">
              +{overflowCount}
            </div>
          }
          index={visibleItems.length}
          size={size}
          orientation={orientation}
        />
      )}
    </RootPrimitive>
  );
}

interface StackItemProps
  extends React.ComponentProps<typeof Slot>,
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
    className,
    style: styleProp,
    ...itemProps
  } = props;

  const style = React.useMemo<React.CSSProperties>(() => {
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
        "size-full shrink-0 overflow-hidden rounded-full [&_img]:size-full [&_img]:object-cover",
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
