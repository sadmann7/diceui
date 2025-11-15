"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

type Side = "top" | "bottom";

function getDataState(isExpanded: boolean) {
  return isExpanded ? "expanded" : "collapsed";
}

interface StackContextValue {
  side: Side;
  childrenCount: number;
  itemCount: number;
  expandedItemCount: number;
  gap: number;
  scale: number;
  offset: number;
  dimensionMapRef: React.RefObject<Map<number, number>>;
  expandOnHover: boolean;
  isExpanded: boolean;
  isInteracting: boolean;
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
  side?: Side;
  itemCount?: number;
  expandedItemCount?: number;
  gap?: number;
  scale?: number;
  offset?: number;
  expandOnHover?: boolean;
  asChild?: boolean;
}

function StackRoot(props: StackRootProps) {
  const {
    side = "bottom",
    itemCount = 3,
    expandedItemCount,
    gap = 8,
    scale = 0.05,
    offset = 10,
    className,
    children,
    style,
    onMouseEnter: onMouseEnterProp,
    onMouseLeave: onMouseLeaveProp,
    onMouseMove: onMouseMoveProp,
    onPointerDown: onPointerDownProp,
    onPointerUp: onPointerUpProp,
    expandOnHover = false,
    asChild,
    ...rootProps
  } = props;

  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isInteracting, setIsInteracting] = React.useState(false);
  const dimensionMapRef = React.useRef(new Map<number, number>());

  const childrenArray = React.Children.toArray(children).filter(
    React.isValidElement,
  );
  const childrenCount = childrenArray.length;

  const effectiveExpandedItemCount = expandedItemCount ?? childrenCount;

  const onMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseEnterProp?.(event);
      if (event.defaultPrevented || !expandOnHover) return;
      setIsExpanded(true);
    },
    [expandOnHover, onMouseEnterProp],
  );

  const onMouseMove = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseMoveProp?.(event);
      if (event.defaultPrevented || !expandOnHover) return;
      setIsExpanded(true);
    },
    [expandOnHover, onMouseMoveProp],
  );

  const onMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      onMouseLeaveProp?.(event);
      if (event.defaultPrevented) return;
      if (expandOnHover && !isInteracting) {
        setIsExpanded(false);
      }
    },
    [expandOnHover, isInteracting, onMouseLeaveProp],
  );

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDownProp?.(event);
      if (event.defaultPrevented) return;
      setIsInteracting(true);
    },
    [onPointerDownProp],
  );

  const onPointerUp = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerUpProp?.(event);
      if (event.defaultPrevented) return;
      setIsInteracting(false);
    },
    [onPointerUpProp],
  );

  const contextValue = React.useMemo<StackContextValue>(
    () => ({
      side,
      childrenCount,
      itemCount,
      expandedItemCount: effectiveExpandedItemCount,
      gap,
      scale,
      offset,
      dimensionMapRef,
      expandOnHover,
      isExpanded,
      isInteracting,
    }),
    [
      side,
      childrenCount,
      itemCount,
      effectiveExpandedItemCount,
      gap,
      scale,
      offset,
      expandOnHover,
      isExpanded,
      isInteracting,
    ],
  );

  const RootPrimitive = asChild ? Slot : "div";

  return (
    <StackContext.Provider value={contextValue}>
      <RootPrimitive
        data-slot="stack"
        data-state={getDataState(isExpanded)}
        onMouseEnter={onMouseEnter}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        {...rootProps}
        className={cn("relative w-full", className)}
        style={
          {
            "--gap": `${gap}px`,
            "--offset": `${offset}px`,
            "--scale": scale,
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

const stackItemWrapperVariants = cva(
  "absolute w-full transition-all duration-300 ease-out",
  {
    variants: {
      side: {
        top: [
          "top-0 left-0 origin-top",
          "translate-y-[calc(var(--translate)*-1)] scale-[var(--item-scale)]",
          "after:absolute after:top-full after:left-0 after:w-full after:content-['']",
        ],
        bottom: [
          "bottom-0 left-0 origin-bottom",
          "translate-y-[var(--translate)] scale-[var(--item-scale)]",
          "after:absolute after:bottom-full after:left-0 after:w-full after:content-['']",
        ],
      },
      isExpanded: {
        true: "after:h-[calc(var(--gap)+1px)]",
        false: "",
      },
      isVisible: {
        true: "",
        false: "pointer-events-none",
      },
    },
  },
);

type StackItemWrapperElement = React.ComponentRef<typeof StackItemWrapper>;

interface StackItemWrapperProps extends React.ComponentProps<"div"> {
  index: number;
}

function StackItemWrapper(props: StackItemWrapperProps) {
  const { children, index, style, ...itemProps } = props;

  const {
    childrenCount,
    itemCount,
    expandedItemCount,
    gap,
    scale,
    offset,
    isExpanded,
    dimensionMapRef,
    side,
  } = useStackContext();

  const itemRef = React.useRef<StackItemWrapperElement>(null);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  const isFront = index === 0;
  const isVisible = isExpanded ? index < expandedItemCount : index < itemCount;

  React.useLayoutEffect(() => {
    const itemNode = itemRef.current;
    if (!itemNode) return;

    const rect = itemNode.getBoundingClientRect();
    const measuredHeight = rect.height;
    const currentScale = 1 - index * scale;
    const naturalHeight = measuredHeight / currentScale;

    const dimensions = dimensionMapRef.current;
    const existingHeight = dimensions.get(index);

    if (existingHeight !== naturalHeight) {
      dimensions.set(index, naturalHeight);
      forceUpdate();
    }
  }, [index, scale, dimensionMapRef]);

  const itemsSizeBefore = React.useMemo(() => {
    const dimensionMap = dimensionMapRef.current;
    let total = 0;
    for (let i = 0; i < index; i++) {
      total += dimensionMap.get(i) ?? 0;
    }
    return total;
  }, [index, dimensionMapRef]);

  const itemScale = isExpanded ? 1 : 1 - index * scale;
  const translateValue = isExpanded
    ? index * gap + itemsSizeBefore
    : index * offset;
  const zIndex = childrenCount - index;

  const opacity = !isVisible ? 0 : isExpanded ? 1 : 1 - index * 0.15;

  return (
    <div
      ref={itemRef}
      data-slot="stack-item-wrapper"
      className={cn(stackItemWrapperVariants({ side, isExpanded, isVisible }))}
      style={
        {
          "--translate": `${translateValue}px`,
          "--item-scale": itemScale,
          zIndex,
          opacity,
          ...style,
        } as React.CSSProperties
      }
      {...itemProps}
    >
      <Slot
        data-index={index}
        data-position={isFront ? "front" : "back"}
        data-state={getDataState(isExpanded)}
      >
        {children}
      </Slot>
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
        "rounded-lg border bg-card p-4 shadow-sm transition-shadow duration-200 hover:shadow-md",
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
