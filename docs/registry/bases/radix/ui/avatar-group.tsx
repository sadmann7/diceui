import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

const avatarGroupVariants = cva("flex items-center", {
  variants: {
    orientation: {
      horizontal: "flex-row",
      vertical: "flex-col",
    },
    dir: {
      ltr: "",
      rtl: "",
    },
  },
  compoundVariants: [
    {
      orientation: "horizontal",
      dir: "ltr",
      className: "-space-x-1",
    },
    {
      orientation: "horizontal",
      dir: "rtl",
      className: "flex-row-reverse -space-x-1 space-x-reverse",
    },
    {
      orientation: "vertical",
      dir: "ltr",
      className: "-space-y-1",
    },
    {
      orientation: "vertical",
      dir: "rtl",
      className: "flex-col-reverse -space-y-1 space-y-reverse",
    },
  ],
  defaultVariants: {
    orientation: "horizontal",
    dir: "ltr",
  },
});

interface AvatarGroupProps
  extends Omit<React.ComponentProps<"div">, "dir">,
    VariantProps<typeof avatarGroupVariants> {
  size?: number;
  max?: number;
  asChild?: boolean;
  reverse?: boolean;
  renderOverflow?: (count: number) => React.ReactNode;
}

function AvatarGroup(props: AvatarGroupProps) {
  const {
    orientation = "horizontal",
    dir = "ltr",
    size = 40,
    max,
    asChild,
    reverse = false,
    renderOverflow,
    className,
    children,
    ...rootProps
  } = props;

  const childrenArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const itemCount = childrenArray.length;
  const shouldTruncate = max && itemCount > max;
  const visibleItems = shouldTruncate
    ? childrenArray.slice(0, max - 1)
    : childrenArray;
  const overflowCount = shouldTruncate ? itemCount - (max - 1) : 0;
  const totalRenderedItems = shouldTruncate ? max : itemCount;

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RootPrimitive
      data-orientation={orientation}
      data-slot="avatar-group"
      {...rootProps}
      className={cn(avatarGroupVariants({ orientation, dir }), className)}
    >
      {visibleItems.map((child, index) => (
        <AvatarGroupItem
          key={index}
          child={child}
          index={index}
          itemCount={totalRenderedItems}
          orientation={orientation}
          dir={dir}
          size={size}
          reverse={reverse}
        />
      ))}
      {shouldTruncate && (
        <AvatarGroupItem
          key="overflow"
          child={
            renderOverflow ? (
              renderOverflow(overflowCount)
            ) : (
              <div className="inline-flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground text-xs">
                +{overflowCount}
              </div>
            )
          }
          index={visibleItems.length}
          itemCount={totalRenderedItems}
          orientation={orientation}
          dir={dir}
          size={size}
          reverse={reverse}
        />
      )}
    </RootPrimitive>
  );
}

interface AvatarGroupItemProps
  extends Omit<React.ComponentProps<typeof SlotPrimitive.Slot>, "dir">,
    VariantProps<typeof avatarGroupVariants> {
  child: React.ReactNode;
  index: number;
  itemCount: number;
  size: number;
  reverse: boolean;
}

function AvatarGroupItem(props: AvatarGroupItemProps) {
  const {
    child,
    index,
    size,
    orientation,
    dir = "ltr",
    reverse = false,
    itemCount,
    className,
    style,
    ...itemProps
  } = props;

  const maskStyle = React.useMemo<React.CSSProperties>(() => {
    let maskImage = "";

    let shouldMask = false;

    if (orientation === "vertical" && dir === "rtl" && reverse) {
      shouldMask = index !== itemCount - 1;
    } else {
      shouldMask = reverse ? index < itemCount - 1 : index > 0;
    }

    if (shouldMask) {
      const maskRadius = size / 2;
      const maskOffset = size / 4 + size / 10;

      if (orientation === "vertical") {
        if (dir === "ltr") {
          if (reverse) {
            maskImage = `radial-gradient(circle ${maskRadius}px at 50% ${size + maskOffset}px, transparent 99%, white 100%)`;
          } else {
            maskImage = `radial-gradient(circle ${maskRadius}px at 50% -${maskOffset}px, transparent 99%, white 100%)`;
          }
        } else {
          if (reverse) {
            maskImage = `radial-gradient(circle ${maskRadius}px at 50% -${maskOffset}px, transparent 99%, white 100%)`;
          } else {
            maskImage = `radial-gradient(circle ${maskRadius}px at 50% ${size + maskOffset}px, transparent 99%, white 100%)`;
          }
        }
      } else {
        if (dir === "ltr") {
          if (reverse) {
            maskImage = `radial-gradient(circle ${maskRadius}px at ${size + maskOffset}px 50%, transparent 99%, white 100%)`;
          } else {
            maskImage = `radial-gradient(circle ${maskRadius}px at -${maskOffset}px 50%, transparent 99%, white 100%)`;
          }
        } else {
          if (reverse) {
            maskImage = `radial-gradient(circle ${maskRadius}px at -${maskOffset}px 50%, transparent 99%, white 100%)`;
          } else {
            maskImage = `radial-gradient(circle ${maskRadius}px at ${size + maskOffset}px 50%, transparent 99%, white 100%)`;
          }
        }
      }
    }

    return {
      width: size,
      height: size,
      maskImage,
    };
  }, [size, index, orientation, dir, reverse, itemCount]);

  return (
    <SlotPrimitive.Slot
      data-slot="avatar-group-item"
      className={cn(
        "size-full shrink-0 overflow-hidden rounded-full [&_img]:size-full",
        className,
      )}
      style={{
        ...maskStyle,
        ...style,
      }}
      {...itemProps}
    >
      {child}
    </SlotPrimitive.Slot>
  );
}

export { AvatarGroup };
