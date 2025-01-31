"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: number;
  gap?: number;
  sequential?: boolean;
  asChild?: boolean;
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnCount = 4,
      gap = 16,
      sequential = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const [maxColumnHeight, setMaxColumnHeight] = React.useState<
      number | undefined
    >();

    const onResize = React.useCallback(() => {
      if (!collectionRef.current) return;

      const items = Array.from(collectionRef.current.children) as HTMLElement[];
      const columnHeights = new Array(columnCount).fill(0);

      // Reset all items
      for (const item of items) {
        item.style.removeProperty("position");
        item.style.removeProperty("top");
        item.style.removeProperty("left");
        item.style.width = `calc(${100 / columnCount}% - ${(gap * (columnCount - 1)) / columnCount}px)`;
      }

      // Position items
      for (const item of items) {
        if (sequential) {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const xPos = columnIndex * (item.offsetWidth + gap);
          const yPos = columnHeights[columnIndex];

          item.style.position = "absolute";
          item.style.top = `${yPos}px`;
          item.style.left = `${xPos}px`;

          columnHeights[columnIndex] += item.offsetHeight + gap;
        } else {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const xPos = columnIndex * (item.offsetWidth + gap);
          const yPos = columnHeights[columnIndex];

          item.style.position = "absolute";
          item.style.top = `${yPos}px`;
          item.style.left = `${xPos}px`;

          columnHeights[columnIndex] += item.offsetHeight + gap;
        }
      }

      setMaxColumnHeight(Math.max(...columnHeights));
    }, [columnCount, gap, sequential]);

    React.useEffect(() => {
      if (typeof ResizeObserver === "undefined") return;

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(onResize);
      });

      if (collectionRef.current) {
        const content = collectionRef.current;
        resizeObserver.observe(content);
        for (const child of Array.from(content.children)) {
          resizeObserver.observe(child);
        }
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [onResize]);

    const RootSlot = asChild ? Slot : "div";

    return (
      <RootSlot
        {...rootProps}
        ref={composedRef}
        className={cn(
          "relative w-full",
          maxColumnHeight && {
            height: maxColumnHeight,
          },
          className,
        )}
      >
        {children}
      </RootSlot>
    );
  },
);
Masonry.displayName = "MasonryRoot";

const Root = Masonry;

export {
  Masonry,
  //
  Root,
};
