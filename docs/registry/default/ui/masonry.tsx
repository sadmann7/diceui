"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "Masonry";
const ITEM_NAME = "MasonryItem";

const MASONRY_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface MasonryRootContextValue {
  columnCount: number;
  gap: number;
  sequential: boolean;
  maxColumnHeight: number | undefined;
  setMaxColumnHeight: (height: number | undefined) => void;
}

const MasonryRootContext = React.createContext<MasonryRootContextValue | null>(
  null,
);
MasonryRootContext.displayName = ROOT_NAME;

function useMasonryContext(name: keyof typeof MASONRY_ERROR) {
  const context = React.useContext(MasonryRootContext);
  if (!context) {
    throw new Error(MASONRY_ERROR[name]);
  }
  return context;
}

type ItemElement = React.ComponentRef<typeof MasonryItem>;

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

    const collectionRef = React.useRef<ItemElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const [maxColumnHeight, setMaxColumnHeight] = React.useState<
      number | undefined
    >();

    const contextValue = React.useMemo(
      () => ({
        columnCount,
        gap,
        sequential,
        maxColumnHeight,
        setMaxColumnHeight,
      }),
      [columnCount, gap, sequential, maxColumnHeight],
    );

    const onResize = React.useCallback(() => {
      if (!collectionRef.current) return;

      const items = Array.from(collectionRef.current.children) as ItemElement[];
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
      <MasonryRootContext.Provider value={contextValue}>
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
      </MasonryRootContext.Provider>
    );
  },
);
Masonry.displayName = ROOT_NAME;

interface MasonryItemProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...itemProps } = props;
    useMasonryContext(ITEM_NAME);

    const ItemSlot = asChild ? Slot : "div";

    return (
      <ItemSlot
        {...itemProps}
        ref={forwardedRef}
        className={cn("break-inside-avoid", className)}
      />
    );
  },
);
MasonryItem.displayName = ITEM_NAME;

const Root = Masonry;
const Item = MasonryItem;

export {
  Masonry,
  MasonryItem,
  //
  Root,
  Item,
};
