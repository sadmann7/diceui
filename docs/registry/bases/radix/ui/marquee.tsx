"use client";

import { useMergedRefs } from "@base-ui/utils/useMergedRefs";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

const ROOT_NAME = "Marquee";
const CONTENT_NAME = "MarqueeContent";

type Side = "left" | "right" | "top" | "bottom";
type Orientation = "horizontal" | "vertical";
type Direction = "ltr" | "rtl";

type RootElement = HTMLDivElement;
type ContentElement = HTMLDivElement;

interface Dimensions {
  width: number;
  height: number;
}

interface ElementDimensions {
  rootSize: number;
  contentSize: number;
}

interface MarqueeSizes {
  root: Dimensions;
  content: Dimensions;
}

function getIsSameDimensions(a: Dimensions, b: Dimensions) {
  return a.width === b.width && a.height === b.height;
}

function getRectDimensions(element: Element): Dimensions {
  const rect = element.getBoundingClientRect();
  return { width: rect.width, height: rect.height };
}

function getElementDimensions(
  sizes: MarqueeSizes | null,
  orientation: Orientation,
): ElementDimensions | null {
  if (!sizes) return null;
  const key = orientation === "vertical" ? "height" : "width";
  return { rootSize: sizes.root[key], contentSize: sizes.content[key] };
}

interface MarqueeContextValue {
  side: Side;
  orientation: Orientation;
  dir: Direction;
  speed: number;
  loopCount: number;
  contentRef: React.RefObject<ContentElement | null>;
  rootRef: React.RefObject<RootElement | null>;
  dimensions: ElementDimensions | null;
  onSizesChange: (sizes: MarqueeSizes) => void;
  autoFill: boolean;
  pauseOnHover: boolean;
  pauseOnKeyboard: boolean;
  reverse: boolean;
  paused: boolean;
}

const MarqueeContext = React.createContext<MarqueeContextValue | null>(null);

function useMarqueeContext(consumerName: string) {
  const context = React.useContext(MarqueeContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface MarqueeProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
  side?: Side;
  dir?: Direction;
  speed?: number;
  delay?: number;
  loopCount?: number;
  gap?: string | number;
  autoFill?: boolean;
  pauseOnHover?: boolean;
  pauseOnKeyboard?: boolean;
  reverse?: boolean;
}

function Marquee(props: MarqueeProps) {
  const {
    side = "left",
    dir: dirProp,
    speed = 50,
    delay = 0,
    loopCount = 0,
    gap = "1rem",
    asChild,
    autoFill = false,
    pauseOnHover = false,
    pauseOnKeyboard = false,
    reverse = false,
    className,
    style: styleProp,
    ref,
    ...marqueeProps
  } = props;

  const orientation: Orientation =
    side === "top" || side === "bottom" ? "vertical" : "horizontal";

  const dir = DirectionPrimitive.useDirection(dirProp);

  const rootRef = React.useRef<RootElement>(null);
  const contentRef = React.useRef<ContentElement>(null);
  const composedRef = useMergedRefs(ref, rootRef);

  const [paused, setPaused] = React.useState(false);

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (pauseOnKeyboard && event.key === " ") {
        event.preventDefault();
        setPaused((prev) => !prev);
      }
    },
    [pauseOnKeyboard],
  );

  const [sizes, setSizes] = React.useState<MarqueeSizes | null>(null);
  const dimensions = getElementDimensions(sizes, orientation);
  const rootSize = dimensions?.rootSize;
  const contentSize = dimensions?.contentSize;

  const duration = React.useMemo(() => {
    const safeSpeed = Math.max(0.001, speed);

    if (rootSize === undefined || contentSize === undefined) {
      const defaultDistance = autoFill ? 1000 : 2000;
      return defaultDistance / safeSpeed;
    }

    if (autoFill) {
      const multiplier =
        contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
      return (contentSize * multiplier) / safeSpeed;
    } else {
      return contentSize < rootSize
        ? rootSize / safeSpeed
        : contentSize / safeSpeed;
    }
  }, [rootSize, contentSize, speed, autoFill]);

  const style = React.useMemo<React.CSSProperties>(
    () => ({
      "--marquee-duration": `${duration}s`,
      "--marquee-gap": gap,
      "--marquee-delay": `${delay}s`,
      "--marquee-loop-count":
        loopCount === 0 || loopCount === Infinity
          ? "infinite"
          : loopCount.toString(),
      ...styleProp,
    }),
    [duration, gap, delay, loopCount, styleProp],
  );

  const contextValue = React.useMemo<MarqueeContextValue>(
    () => ({
      side,
      orientation,
      dir,
      speed,
      loopCount,
      contentRef,
      rootRef,
      dimensions:
        rootSize === undefined || contentSize === undefined
          ? null
          : { rootSize, contentSize },
      onSizesChange: setSizes,
      autoFill,
      paused,
      pauseOnHover,
      pauseOnKeyboard,
      reverse,
    }),
    [
      side,
      orientation,
      dir,
      speed,
      loopCount,
      rootSize,
      contentSize,
      autoFill,
      paused,
      pauseOnHover,
      pauseOnKeyboard,
      reverse,
    ],
  );

  const MarqueePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <MarqueeContext.Provider value={contextValue}>
      <div data-slot="marquee-wrapper" className="cn-marquee-wrapper">
        <MarqueePrimitive
          role="marquee"
          aria-live="off"
          data-orientation={orientation}
          data-slot="marquee"
          dir={dir}
          tabIndex={pauseOnKeyboard ? 0 : undefined}
          {...marqueeProps}
          ref={composedRef}
          className={cn(
            "cn-marquee",
            orientation === "vertical" && "h-full flex-col",
            orientation === "horizontal" && "w-full",
            paused && "[&_*]:[animation-play-state:paused]",
            pauseOnHover && "group",
            pauseOnKeyboard &&
              "rounded-md focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            className,
          )}
          style={style}
          onKeyDown={pauseOnKeyboard ? onKeyDown : undefined}
        />
      </div>
    </MarqueeContext.Provider>
  );
}

const marqueeContentVariants = cva("cn-marquee-content", {
  variants: {
    side: {
      left: "cn-marquee-content-side-left",
      right: "cn-marquee-content-side-right",
      top: "cn-marquee-content-side-top",
      bottom: "cn-marquee-content-side-bottom",
    },
    dir: {
      ltr: "",
      rtl: "",
    },
    pauseOnHover: {
      true: "cn-marquee-content-pause-on-hover-true",
      false: "",
    },
    reverse: {
      true: "cn-marquee-content-reverse-true",
      false: "",
    },
  },
  compoundVariants: [
    {
      side: "left",
      dir: "rtl",
      className: "animate-marquee-left-rtl",
    },
    {
      side: "right",
      dir: "rtl",
      className: "animate-marquee-right-rtl",
    },
  ],
  defaultVariants: {
    side: "left",
    dir: "ltr",
    pauseOnHover: false,
    reverse: false,
  },
});

interface MarqueeContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MarqueeContent(props: MarqueeContentProps) {
  const {
    className,
    asChild,
    ref,
    children,
    style: styleProp,
    ...contentProps
  } = props;

  const context = useMarqueeContext(CONTENT_NAME);
  const composedRef = useMergedRefs(ref, context.contentRef);

  const isVertical = context.orientation === "vertical";
  const isRtl = context.dir === "rtl";

  const { rootRef, contentRef, dimensions, onSizesChange } = context;

  React.useEffect(() => {
    const rootElement = rootRef.current;
    const contentElement = contentRef.current;
    if (
      typeof ResizeObserver === "undefined" ||
      !rootElement ||
      !contentElement
    ) {
      return;
    }

    let sizes: MarqueeSizes = {
      root: getRectDimensions(rootElement),
      content: getRectDimensions(contentElement),
    };
    if (
      sizes.root.width > 0 &&
      sizes.root.height > 0 &&
      sizes.content.width > 0 &&
      sizes.content.height > 0
    ) {
      onSizesChange(sizes);
    }

    const observer = new ResizeObserver((entries) => {
      let nextSizes = sizes;
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const key = entry.target === rootElement ? "root" : "content";
        if (!getIsSameDimensions(nextSizes[key], { width, height })) {
          nextSizes = { ...nextSizes, [key]: { width, height } };
        }
      }
      if (nextSizes === sizes) return;
      sizes = nextSizes;
      onSizesChange(sizes);
    });

    observer.observe(rootElement);
    observer.observe(contentElement);
    return () => observer.disconnect();
  }, [rootRef, contentRef, onSizesChange]);

  const multiplier = React.useMemo(() => {
    if (!context.autoFill || !dimensions) return 1;

    const { rootSize, contentSize } = dimensions;
    if (contentSize === 0) return 1;

    return contentSize < rootSize ? Math.ceil(rootSize / contentSize) : 1;
  }, [context.autoFill, dimensions]);

  const onMultipliedChildrenRender = React.useCallback(
    (count: number) => {
      return Array.from({ length: Math.max(0, count) }).map((_, i) => (
        <React.Fragment key={i}>{children}</React.Fragment>
      ));
    },
    [children],
  );

  const style = React.useMemo(
    () => ({
      ...styleProp,
      animationDuration: "var(--marquee-duration)",
      animationDelay: "var(--marquee-delay)",
      animationIterationCount: "var(--marquee-loop-count)",
      animationDirection: context.reverse ? "reverse" : "normal",
    }),
    [styleProp, context.reverse],
  );

  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <>
      <ContentPrimitive
        data-orientation={context.orientation}
        data-slot="marquee-content"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            dir: context.dir,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
          isVertical && "flex-col",
          isVertical
            ? "mb-(--marquee-gap)"
            : isRtl
              ? "ml-(--marquee-gap)"
              : "mr-(--marquee-gap)",
        )}
      >
        <div
          ref={composedRef}
          className={cn("cn-marquee-content-2", isVertical && "flex-col")}
        >
          {children}
        </div>
        {onMultipliedChildrenRender(multiplier - 1)}
      </ContentPrimitive>
      <ContentPrimitive
        role="presentation"
        aria-hidden="true"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            dir: context.dir,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
          isVertical && "flex-col",
        )}
      >
        {onMultipliedChildrenRender(multiplier)}
      </ContentPrimitive>
    </>
  );
}

interface MarqueeItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MarqueeItem(props: MarqueeItemProps) {
  const { className, asChild, ...itemProps } = props;

  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      data-slot="marquee-item"
      {...itemProps}
      className={cn("cn-marquee-item", className)}
    />
  );
}

const marqueeEdgeVariants = cva("cn-marquee-edge", {
  variants: {
    side: {
      left: "cn-marquee-edge-side-left-radix",
      right: "cn-marquee-edge-side-right-radix",
      top: "cn-marquee-edge-side-top-radix",
      bottom: "cn-marquee-edge-side-bottom-radix",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
    },
  },
  compoundVariants: [
    {
      side: ["left", "right"],
      size: "default",
      className: "w-1/4",
    },
    {
      side: ["left", "right"],
      size: "sm",
      className: "w-1/6",
    },
    {
      side: ["left", "right"],
      size: "lg",
      className: "w-1/3",
    },
    {
      side: ["top", "bottom"],
      size: "default",
      className: "h-1/4",
    },
    {
      side: ["top", "bottom"],
      size: "sm",
      className: "h-1/6",
    },
    {
      side: ["top", "bottom"],
      size: "lg",
      className: "h-1/3",
    },
  ],
  defaultVariants: {
    size: "default",
  },
});

interface MarqueeEdgeProps
  extends
    VariantProps<typeof marqueeEdgeVariants>,
    React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MarqueeEdge(props: MarqueeEdgeProps) {
  const { side, size, className, asChild, ...edgeProps } = props;

  const EdgePrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <EdgePrimitive
      data-size={size}
      data-slot="marquee-edge"
      {...edgeProps}
      className={cn(marqueeEdgeVariants({ side, size, className }))}
    />
  );
}

export { Marquee, MarqueeContent, MarqueeEdge, MarqueeItem, type MarqueeProps };
