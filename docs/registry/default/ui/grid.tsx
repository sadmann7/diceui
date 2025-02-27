import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";
type BreakpointValue<T> = T | Partial<Record<Breakpoint, T>>;

function getResponsiveClasses(
  value: BreakpointValue<number | string | undefined>,
  prefix: string,
): string {
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([breakpoint, val]) => {
        const breakpointPrefix = breakpoint === "sm" ? "" : `${breakpoint}:`;
        return `${breakpointPrefix}${prefix}-${val}`;
      })
      .join(" ");
  }
  return typeof value === "number"
    ? `${prefix}-${value}`
    : `${prefix}-${value}`;
}

interface GridRootProps extends React.ComponentPropsWithoutRef<"div"> {
  variant?: "default" | "bento";
  asChild?: boolean;
}

const GridRoot = React.forwardRef<HTMLDivElement, GridRootProps>(
  (props, forwardedRef) => {
    const { variant = "default", asChild, className, ...rootProps } = props;

    const RootPrimitive = asChild ? Slot : "div";

    return (
      <RootPrimitive
        data-slot="grid"
        {...rootProps}
        ref={forwardedRef}
        className={cn(
          "grid gap-4",
          variant === "bento" && "grid-flow-dense",
          className,
        )}
      />
    );
  },
);
GridRoot.displayName = "GridRoot";

interface GridItemProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  colSpan?: BreakpointValue<number>;
  rowSpan?: BreakpointValue<number>;
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, colSpan, rowSpan, ...itemProps } = props;

    const ItemPrimitive = asChild ? Slot : "div";

    const itemClasses = React.useMemo(
      () =>
        cn(
          colSpan && getResponsiveClasses(colSpan, "col-span"),
          rowSpan && getResponsiveClasses(rowSpan, "row-span"),
          className,
        ),
      [colSpan, rowSpan, className],
    );

    return (
      <ItemPrimitive
        data-slot="grid-item"
        {...itemProps}
        ref={forwardedRef}
        className={itemClasses}
      />
    );
  },
);
GridItem.displayName = "GridItem";

const Grid = GridRoot;
const Root = GridRoot;
const Item = GridItem;

export {
  Grid,
  GridItem,
  //
  Root,
  Item,
};
