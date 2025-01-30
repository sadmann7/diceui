"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

interface MasonryContextValue {
  columnCount: number;
  columnWidth: number;
  gap: number;
  itemMap: Map<number, { height: number; element: ItemElement }>;
  onItemRegister: (index: number, element: ItemElement) => void;
  onItemUnregister: (index: number) => void;
}

const MasonryContext = React.createContext<MasonryContextValue | undefined>(
  undefined,
);

interface MasonryProps extends React.HTMLAttributes<HTMLDivElement> {
  columnWidth?: number;
  gap?: number;
  asChild?: boolean;
}

const MasonryRoot = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      columnWidth = 300,
      gap = 16,
      className,
      children,
      asChild,
      ...rootProps
    } = props;
    const collectionRef = React.useRef<HTMLDivElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, collectionRef);
    const [containerWidth, setContainerWidth] = React.useState(0);

    const itemMap = React.useRef(
      new Map<number, { height: number; element: ItemElement }>(),
    ).current;

    const getItems = React.useCallback(() => {
      const collectionNode = collectionRef.current;
      if (!collectionNode) return [];

      const allItems = Array.from(itemMap.values());

      return allItems.sort((a, b) => {
        const position = a.element.compareDocumentPosition(b.element);
        if (
          position & Node.DOCUMENT_POSITION_FOLLOWING ||
          position & Node.DOCUMENT_POSITION_CONTAINED_BY
        ) {
          return -1;
        }
        if (
          position & Node.DOCUMENT_POSITION_PRECEDING ||
          position & Node.DOCUMENT_POSITION_CONTAINS
        ) {
          return 1;
        }
        return 0;
      });
    }, [itemMap]);

    const [positions, setPositions] = React.useState<
      Map<number, { top: number; left: number }>
    >(new Map());

    // Calculate number of columns based on container width
    const columnCount = Math.max(
      1,
      Math.floor((containerWidth + gap) / (columnWidth + gap)),
    );
    const actualColumnWidth =
      (containerWidth - (columnCount - 1) * gap) / columnCount;

    // Track container width changes
    React.useEffect(() => {
      if (!collectionRef.current) return;

      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          setContainerWidth(entry.contentRect.width);
        }
      });

      observer.observe(collectionRef.current);
      setContainerWidth(collectionRef.current.offsetWidth);

      return () => observer.disconnect();
    }, []);

    // Register/unregister items and recalculate layout
    const onItemRegister = React.useCallback(
      (index: number, element: ItemElement) => {
        itemMap.set(index, { height: element.offsetHeight, element });
        recalculateLayout();
      },
      [itemMap],
    );

    const onItemUnregister = React.useCallback(
      (index: number) => {
        itemMap.delete(index);
        recalculateLayout();
      },
      [itemMap],
    );

    // Calculate item positions using pre-sorted items
    const recalculateLayout = React.useCallback(() => {
      if (!collectionRef.current || !itemMap.size) return;

      const columnHeights = new Array(columnCount).fill(0);
      const newPositions = new Map<number, { top: number; left: number }>();

      const sortedItems = getItems();

      for (const [index, item] of sortedItems.entries()) {
        // Find shortest column
        const minHeight = Math.min(...columnHeights);
        const columnIndex = columnHeights.indexOf(minHeight);

        // Calculate position
        const left = columnIndex * (actualColumnWidth + gap);
        const top = columnHeights[columnIndex];

        newPositions.set(index, { top, left });
        columnHeights[columnIndex] += item.height + gap;
      }

      setPositions(newPositions);
    }, [columnCount, actualColumnWidth, gap, getItems, itemMap]);

    const contextValue = React.useMemo<MasonryContextValue>(
      () => ({
        columnCount,
        columnWidth: actualColumnWidth,
        gap,
        itemMap,
        onItemRegister,
        onItemUnregister,
      }),
      [
        columnCount,
        actualColumnWidth,
        gap,
        itemMap,
        onItemRegister,
        onItemUnregister,
      ],
    );

    const Comp = asChild ? Slot : "div";

    return (
      <MasonryContext.Provider value={contextValue}>
        <Comp
          ref={composedRefs}
          className={cn("relative w-full", className)}
          {...rootProps}
        >
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;

            const position = positions.get(index);
            return position ? (
              <div
                style={{
                  position: "absolute",
                  top: position.top,
                  left: position.left,
                  width: actualColumnWidth,
                  transform: "translate3d(0, 0, 0)",
                }}
              >
                {child}
              </div>
            ) : (
              <div style={{ opacity: 0, pointerEvents: "none" }}>{child}</div>
            );
          })}
        </Comp>
      </MasonryContext.Provider>
    );
  },
);
MasonryRoot.displayName = "MasonryRoot";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

type ItemElement = React.ComponentRef<"div">;

interface MasonryItemProps extends React.HTMLAttributes<ItemElement> {
  index: number;
  asChild?: boolean;
}

const MasonryItem = React.forwardRef<ItemElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { index, className, children, asChild, ...itemProps } = props;
    const itemRef = React.useRef<ItemElement>(null);
    const composedRefs = useComposedRefs(forwardedRef, itemRef);
    const context = React.useContext(MasonryContext);

    if (!context) {
      throw new Error("MasonryItem must be used within MasonryRoot");
    }

    useIsomorphicLayoutEffect(() => {
      const element = itemRef.current;
      if (!element) return;

      const observer = new ResizeObserver(() => {
        if (element) {
          context.onItemRegister(index, element);
        }
      });

      observer.observe(element);
      context.onItemRegister(index, element);

      return () => {
        observer.disconnect();
        context.onItemUnregister(index);
      };
    }, [context, index]);

    const Comp = asChild ? Slot : "div";

    return (
      <Comp ref={composedRefs} className={cn(className)} {...itemProps}>
        {children}
      </Comp>
    );
  },
);
MasonryItem.displayName = "MasonryItem";

export { MasonryItem, MasonryRoot };
