"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "Masonry";
const CONTENT_NAME = "MasonryContent";
const ITEM_NAME = "MasonryItem";

const MASONRY_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [CONTENT_NAME]: `\`${CONTENT_NAME}\` must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${CONTENT_NAME}\``,
} as const;

interface MasonryRootContextValue {
  id: string;
  columns: number;
  spacing: number;
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

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columns?: number;
  spacing?: number;
  sequential?: boolean;
  asChild?: boolean;
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columns = 4,
      spacing = 16,
      sequential = false,
      asChild,
      className,
      ...rootProps
    } = props;

    const id = React.useId();
    const [maxColumnHeight, setMaxColumnHeight] = React.useState<number>();

    const contextValue = React.useMemo(
      () => ({
        id,
        columns,
        spacing,
        sequential,
        maxColumnHeight,
        setMaxColumnHeight,
      }),
      [id, columns, spacing, sequential, maxColumnHeight],
    );

    const RootSlot = asChild ? Slot : "div";

    return (
      <MasonryRootContext.Provider value={contextValue}>
        <RootSlot
          {...rootProps}
          ref={forwardedRef}
          className={cn("relative w-full", className)}
        >
          {children}
        </RootSlot>
      </MasonryRootContext.Provider>
    );
  },
);
Masonry.displayName = ROOT_NAME;

const MasonryContentContext = React.createContext<boolean>(false);
MasonryContentContext.displayName = CONTENT_NAME;

interface MasonryContentProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MasonryContent = React.forwardRef<HTMLDivElement, MasonryContentProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...contentProps } = props;
    const context = useMasonryContext(CONTENT_NAME);
    const contentRef = React.useRef<HTMLDivElement>(null);

    const handleResize = React.useCallback(() => {
      if (!contentRef.current) return;

      const content = contentRef.current;
      const items = Array.from(content.children) as HTMLElement[];
      const columnCount = context.columns;
      const columnHeights = new Array(columnCount).fill(0);
      const columnGap = context.spacing;

      // Reset all items
      for (const item of items) {
        item.style.removeProperty("position");
        item.style.removeProperty("top");
        item.style.removeProperty("left");
        item.style.width = `calc(${100 / columnCount}% - ${(columnGap * (columnCount - 1)) / columnCount}px)`;
      }

      // Position items
      for (const item of items) {
        if (context.sequential) {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const xPos = columnIndex * (item.offsetWidth + columnGap);
          const yPos = columnHeights[columnIndex];

          item.style.position = "absolute";
          item.style.top = `${yPos}px`;
          item.style.left = `${xPos}px`;

          columnHeights[columnIndex] += item.offsetHeight + columnGap;
        } else {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const xPos = columnIndex * (item.offsetWidth + columnGap);
          const yPos = columnHeights[columnIndex];

          item.style.position = "absolute";
          item.style.top = `${yPos}px`;
          item.style.left = `${xPos}px`;

          columnHeights[columnIndex] += item.offsetHeight + columnGap;
        }
      }

      context.setMaxColumnHeight(Math.max(...columnHeights));
    }, [context]);

    React.useEffect(() => {
      if (typeof ResizeObserver === "undefined") return;

      const resizeObserver = new ResizeObserver(() => {
        requestAnimationFrame(handleResize);
      });

      if (contentRef.current) {
        const content = contentRef.current;
        resizeObserver.observe(content);
        for (const child of Array.from(content.children)) {
          resizeObserver.observe(child);
        }
      }

      return () => {
        resizeObserver.disconnect();
      };
    }, [handleResize]);

    const composedRef = useComposedRefs(forwardedRef, contentRef);
    const ContentSlot = asChild ? Slot : "div";

    return (
      <MasonryContentContext.Provider value={true}>
        <ContentSlot
          {...contentProps}
          ref={composedRef}
          className={cn(
            "relative w-full",
            context.maxColumnHeight && {
              height: context.maxColumnHeight,
            },
            className,
          )}
        >
          {props.children}
        </ContentSlot>
      </MasonryContentContext.Provider>
    );
  },
);
MasonryContent.displayName = CONTENT_NAME;

interface MasonryItemProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { asChild, className, ...itemProps } = props;
    const inMasonryContent = React.useContext(MasonryContentContext);

    if (!inMasonryContent) {
      throw new Error(MASONRY_ERROR[ITEM_NAME]);
    }

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
const Content = MasonryContent;
const Item = MasonryItem;

export {
  Masonry,
  MasonryContent,
  MasonryItem,
  //
  Root,
  Content,
  Item,
};
