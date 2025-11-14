"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

interface ItemHeight {
  itemId: number;
  height: number;
}

interface StackContextValue {
  visibleItems: number;
  gap: number;
  scaleFactor: number;
  expandOnHover: boolean;
  offset: number;
  isExpanded: boolean;
  isInteracting: boolean;
  totalItems: number;
  heights: ItemHeight[];
  setHeights: React.Dispatch<React.SetStateAction<ItemHeight[]>>;
}

const StackContext = React.createContext<StackContextValue | null>(null);

function useStackContext() {
  const context = React.useContext(StackContext);
  if (!context) {
    throw new Error("Stack components must be used within Stack.Root");
  }
  return context;
}

interface StackRootProps extends React.ComponentProps<"div"> {
  visibleItems?: number;
  gap?: number;
  scaleFactor?: number;
  expandOnHover?: boolean;
  offset?: number;
  asChild?: boolean;
}

function StackRoot(props: StackRootProps) {
  const {
    visibleItems = 3,
    gap = 8,
    scaleFactor = 0.05,
    expandOnHover = true,
    offset = 10,
    asChild,
    className,
    children,
    style,
    onMouseEnter,
    onMouseLeave,
    ...rootProps
  } = props;

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isInteracting, setIsInteracting] = React.useState(false);
  const [heights, setHeights] = React.useState<ItemHeight[]>([]);

  const childrenArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const totalItems = childrenArray.length;

  const RootPrimitive = asChild ? Slot : "div";

  const contextValue = React.useMemo<StackContextValue>(
    () => ({
      visibleItems,
      gap,
      scaleFactor,
      expandOnHover,
      offset,
      isExpanded,
      isInteracting,
      totalItems,
      heights,
      setHeights,
    }),
    [
      visibleItems,
      gap,
      scaleFactor,
      expandOnHover,
      offset,
      isExpanded,
      isInteracting,
      totalItems,
      heights,
    ],
  );

  const onMouseEnterHandler = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnter?.(event);
      if (event.defaultPrevented) return;

      if (expandOnHover) {
        setIsExpanded(true);
      }
    },
    [expandOnHover, onMouseEnter],
  );

  const onMouseMoveHandler = React.useCallback(() => {
    if (expandOnHover) {
      setIsExpanded(true);
    }
  }, [expandOnHover]);

  const onMouseLeaveHandler = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeave?.(event);
      if (event.defaultPrevented) return;

      if (expandOnHover && !isInteracting) {
        setIsExpanded(false);
      }
    },
    [expandOnHover, isInteracting, onMouseLeave],
  );

  const onPointerDownHandler = React.useCallback(() => {
    setIsInteracting(true);
  }, []);

  const onPointerUpHandler = React.useCallback(() => {
    setIsInteracting(false);
  }, []);

  return (
    <StackContext.Provider value={contextValue}>
      <RootPrimitive
        data-slot="stack"
        data-expanded={isExpanded}
        onMouseEnter={onMouseEnterHandler}
        onMouseMove={onMouseMoveHandler}
        onMouseLeave={onMouseLeaveHandler}
        onPointerDown={onPointerDownHandler}
        onPointerUp={onPointerUpHandler}
        {...rootProps}
        className={cn("relative", className)}
        style={
          {
            "--stack-gap": `${gap}px`,
            "--stack-offset": `${offset}px`,
            "--stack-scale-factor": scaleFactor,
            ...style,
          } as React.CSSProperties
        }
      >
        {childrenArray.map((child, index) => (
          <StackItemWrapper key={index} index={index}>
            {child}
          </StackItemWrapper>
        ))}
      </RootPrimitive>
    </StackContext.Provider>
  );
}

interface StackItemWrapperProps extends React.ComponentProps<"div"> {
  index: number;
}

function StackItemWrapper(props: StackItemWrapperProps) {
  const { children, index, style, ...itemProps } = props;

  const {
    visibleItems,
    gap,
    scaleFactor,
    offset,
    isExpanded,
    totalItems,
    heights,
    setHeights,
  } = useStackContext();

  const itemRef = React.useRef<HTMLDivElement>(null);

  const isFront = index === 0;
  const isVisible = index < visibleItems;
  const itemsBefore = index;

  React.useEffect(() => {
    const itemNode = itemRef.current;
    if (itemNode) {
      const height = itemNode.getBoundingClientRect().height;
      setHeights((h) => {
        const existing = h.find((item) => item.itemId === index);
        if (!existing) {
          return [...h, { itemId: index, height }];
        }
        return h.map((item) =>
          item.itemId === index ? { ...item, height } : item,
        );
      });
    }
  }, [index, setHeights]);

  const itemsHeightBefore = React.useMemo(() => {
    return heights.reduce((prev, curr) => {
      if (curr.itemId >= index) return prev;
      return prev + curr.height;
    }, 0);
  }, [heights, index]);

  const scale = isExpanded ? 1 : 1 - itemsBefore * scaleFactor;
  const translateY = isExpanded
    ? itemsBefore * gap + itemsHeightBefore
    : itemsBefore * offset;
  const zIndex = totalItems - index;

  const opacity = isExpanded ? 1 : isVisible ? 1 - itemsBefore * 0.15 : 0;

  return (
    <div
      ref={itemRef}
      data-slot="stack-item-wrapper"
      data-index={index}
      data-front={isFront}
      data-visible={isVisible}
      data-expanded={isExpanded}
      className={cn(
        "absolute top-0 left-0 w-full transition-all duration-300 ease-out",
        !isVisible && "pointer-events-none",
        // Add hover area for expanded state to prevent jitter
        "after:absolute after:bottom-full after:left-0 after:w-full after:content-['']",
        isExpanded && "after:h-[calc(var(--stack-gap)+1px)]",
      )}
      style={{
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: "top center",
        zIndex,
        opacity,
        ...style,
      }}
      {...itemProps}
    >
      {children}
    </div>
  );
}

interface StackItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function StackItem(props: StackItemProps) {
  const { asChild, className, ...itemProps } = props;

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      data-slot="stack-item"
      {...itemProps}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-md",
        "transition-shadow duration-200",
        "hover:shadow-lg",
        className,
      )}
    />
  );
}

export {
  StackRoot as Root,
  StackItem as Item,
  //
  StackRoot as Stack,
  StackItem,
};
