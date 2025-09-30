"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const ROOT_NAME = "Marquee";
const CONTENT_NAME = "MarqueeContent";

type Side = "left" | "right" | "top" | "bottom";
type Orientation = "horizontal" | "vertical";

type RootElement = React.ComponentRef<typeof MarqueeRoot>;
type ContentElement = React.ComponentRef<typeof MarqueeContent>;

interface Dimensions {
  width: number;
  height: number;
}

interface ElementDimensions {
  rootSize: number;
  contentSize: number;
}

function createResizeObserverStore() {
  const listeners = new Set<() => void>();
  let observer: ResizeObserver | null = null;
  const elements = new Map<Element, Dimensions>();
  const refCounts = new Map<Element, number>();
  const isSupported = typeof ResizeObserver !== "undefined";
  let notificationScheduled = false;

  const snapshotCache = new WeakMap<
    Element,
    WeakMap<
      Element,
      { horizontal: ElementDimensions; vertical: ElementDimensions }
    >
  >();

  function notify() {
    if (notificationScheduled) return;
    notificationScheduled = true;
    queueMicrotask(() => {
      notificationScheduled = false;
      for (const callback of listeners) {
        callback();
      }
    });
  }

  function cleanup() {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    elements.clear();
    refCounts.clear();
  }

  function subscribe(callback: () => void) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        cleanup();
      }
    };
  }

  function getSnapshot(
    rootElement: RootElement | null,
    contentElement: ContentElement | null,
    orientation: Orientation,
  ): ElementDimensions | null {
    if (!rootElement || !contentElement) return null;

    const rootDims = elements.get(rootElement);
    const contentDims = elements.get(contentElement);

    if (!rootDims || !contentDims) return null;

    const rootSize =
      orientation === "vertical" ? rootDims.height : rootDims.width;
    const contentSize =
      orientation === "vertical" ? contentDims.height : contentDims.width;

    let rootCache = snapshotCache.get(rootElement);
    if (!rootCache) {
      rootCache = new WeakMap();
      snapshotCache.set(rootElement, rootCache);
    }

    let contentCache = rootCache.get(contentElement);
    if (!contentCache) {
      contentCache = {
        horizontal: { rootSize: -1, contentSize: -1 },
        vertical: { rootSize: -1, contentSize: -1 },
      };
      rootCache.set(contentElement, contentCache);
    }

    const cached = contentCache[orientation];
    if (cached.rootSize === rootSize && cached.contentSize === contentSize) {
      return cached;
    }

    const snapshot = { rootSize, contentSize };
    contentCache[orientation] = snapshot;
    return snapshot;
  }

  function observe(
    rootElement: RootElement | null,
    contentElement: Element | null,
  ) {
    if (!isSupported || !rootElement || !contentElement) return;

    if (!observer) {
      observer = new ResizeObserver((entries) => {
        let hasChanged = false;

        for (const entry of entries) {
          const element = entry.target;
          const { width, height } = entry.contentRect;

          const currentData = elements.get(element);

          if (
            !currentData ||
            currentData.width !== width ||
            currentData.height !== height
          ) {
            elements.set(element, { width, height });
            hasChanged = true;
          }
        }

        if (hasChanged) {
          notify();
        }
      });
    }

    refCounts.set(rootElement, (refCounts.get(rootElement) ?? 0) + 1);
    refCounts.set(contentElement, (refCounts.get(contentElement) ?? 0) + 1);

    observer.observe(rootElement);
    observer.observe(contentElement);

    const rootRect = rootElement.getBoundingClientRect();
    const contentRect = contentElement.getBoundingClientRect();

    elements.set(rootElement, {
      width: rootRect.width,
      height: rootRect.height,
    });
    elements.set(contentElement, {
      width: contentRect.width,
      height: contentRect.height,
    });
  }

  function unobserve(
    rootElement: RootElement | null,
    contentElement: Element | null,
  ) {
    if (!observer || !rootElement || !contentElement) return;

    const rootCount = (refCounts.get(rootElement) ?? 1) - 1;
    const contentCount = (refCounts.get(contentElement) ?? 1) - 1;

    if (rootCount <= 0) {
      observer.unobserve(rootElement);
      elements.delete(rootElement);
      refCounts.delete(rootElement);
    } else {
      refCounts.set(rootElement, rootCount);
    }

    if (contentCount <= 0) {
      observer.unobserve(contentElement);
      elements.delete(contentElement);
      refCounts.delete(contentElement);
    } else {
      refCounts.set(contentElement, contentCount);
    }
  }

  return {
    subscribe,
    getSnapshot,
    observe,
    unobserve,
  };
}

const resizeObserverStore = createResizeObserverStore();

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface MarqueeContextValue {
  side: Side;
  orientation: Orientation;
  loopCount: number;
  contentRef: React.RefObject<ContentElement | null>;
  dimensions: ElementDimensions | null;
  autoFill: boolean;
  pauseOnHover: boolean;
  reverse: boolean;
}

const MarqueeContext = React.createContext<MarqueeContextValue | null>(null);

function useMarqueeContext(consumerName: string) {
  const context = React.useContext(MarqueeContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

interface MarqueeRootProps extends DivProps {
  side?: Side;
  speed?: number;
  loopCount?: number;
  gap?: string;
  autoFill?: boolean;
  pauseOnHover?: boolean;
  reverse?: boolean;
}

function MarqueeRoot(props: MarqueeRootProps) {
  const {
    side = "left",
    speed = 50,
    loopCount = 0,
    gap = "1rem",
    autoFill = false,
    pauseOnHover = false,
    reverse = false,
    className,
    style,
    children,
    asChild,
    ref,
    ...marqueeProps
  } = props;

  const orientation: Orientation =
    side === "top" || side === "bottom" ? "vertical" : "horizontal";

  const rootRef = React.useRef<RootElement>(null);
  const contentRef = React.useRef<ContentElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  const onSubscribe = React.useCallback(
    (callback: () => void) => resizeObserverStore.subscribe(callback),
    [],
  );

  const getSnapshot = React.useCallback(
    () =>
      resizeObserverStore.getSnapshot(
        rootRef.current,
        contentRef.current,
        orientation,
      ),
    [orientation],
  );

  const dimensions = React.useSyncExternalStore(
    onSubscribe,
    getSnapshot,
    getSnapshot,
  );

  const duration = React.useMemo(() => {
    if (!dimensions) {
      const safeSpeed = Math.max(0.001, speed);
      const defaultDistance = 2000;
      return defaultDistance / safeSpeed;
    }

    const { rootSize, contentSize } = dimensions;
    const distance = contentSize + rootSize;
    const safeSpeed = Math.max(0.001, speed);
    return distance / safeSpeed;
  }, [dimensions, speed]);

  React.useEffect(() => {
    if (rootRef.current && contentRef.current) {
      resizeObserverStore.observe(rootRef.current, contentRef.current);

      return () => {
        resizeObserverStore.unobserve(rootRef.current, contentRef.current);
      };
    }
  }, []);

  const marqueeStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--duration": `${duration}s`,
      "--gap": gap,
      "--loop-count":
        loopCount === 0 || loopCount === Infinity
          ? "infinite"
          : loopCount.toString(),
      ...style,
    }),
    [duration, gap, loopCount, style],
  );

  const contextValue = React.useMemo<MarqueeContextValue>(
    () => ({
      side,
      orientation,
      loopCount,
      contentRef,
      dimensions,
      autoFill,
      pauseOnHover,
      reverse,
    }),
    [side, pauseOnHover, reverse, orientation, loopCount, autoFill, dimensions],
  );

  const MarqueePrimitive = asChild ? Slot : "div";

  return (
    <MarqueeContext.Provider value={contextValue}>
      <MarqueePrimitive
        aria-live="off"
        data-slot="marquee"
        data-orientation={orientation}
        {...marqueeProps}
        ref={composedRef}
        style={marqueeStyle}
        className={cn(
          "relative flex overflow-hidden [--duration:40s] [--gap:1rem] [--loop-count:infinite] motion-reduce:animate-none",
          orientation === "vertical" && "h-full flex-col",
          orientation === "horizontal" && "w-full",
          pauseOnHover && "group",
          className,
        )}
      >
        {children}
      </MarqueePrimitive>
    </MarqueeContext.Provider>
  );
}

const marqueeContentVariants = cva("flex shrink-0", {
  variants: {
    side: {
      left: "animate-marquee-left",
      right: "animate-marquee-right",
      top: "animate-marquee-up flex-col",
      bottom: "animate-marquee-down flex-col",
    },
    pauseOnHover: {
      true: "group-hover:[animation-play-state:paused]",
      false: "",
    },
    reverse: {
      true: "[animation-direction:reverse]",
      false: "",
    },
  },
  defaultVariants: {
    side: "left",
    pauseOnHover: false,
    reverse: false,
  },
});

function MarqueeContent(props: DivProps) {
  const { className, asChild, ref, children, style, ...contentProps } = props;

  const context = useMarqueeContext(CONTENT_NAME);

  const composedRef = useComposedRefs(ref, context.contentRef);
  const ContentPrimitive = asChild ? Slot : "div";
  const isVertical = context.orientation === "vertical";

  const multiplier = React.useMemo(() => {
    if (!context.autoFill || !context.dimensions) return 1;

    const { rootSize, contentSize } = context.dimensions;
    if (contentSize === 0) return 1;

    return Math.ceil(rootSize / contentSize);
  }, [context.autoFill, context.dimensions]);

  const onContentRender = React.useCallback(
    (withRef: boolean = true) => (
      <div
        className={cn(
          "flex shrink-0 [gap:var(--gap)]",
          isVertical && "flex-col",
          isVertical
            ? "[margin-bottom:var(--gap)]"
            : "[margin-right:var(--gap)]",
        )}
        ref={withRef ? composedRef : undefined}
      >
        {Array.from({ length: multiplier }).map((_, index) => (
          <React.Fragment key={index}>{children}</React.Fragment>
        ))}
      </div>
    ),
    [children, multiplier, isVertical, composedRef],
  );

  return (
    <>
      <ContentPrimitive
        data-slot="marquee-content"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
        )}
      >
        {onContentRender()}
      </ContentPrimitive>
      <ContentPrimitive
        role="presentation"
        aria-hidden="true"
        {...contentProps}
        style={style}
        className={cn(
          marqueeContentVariants({
            side: context.side,
            pauseOnHover: context.pauseOnHover,
            reverse: context.reverse,
            className,
          }),
        )}
      >
        {onContentRender(false)}
      </ContentPrimitive>
    </>
  );
}

function MarqueeItem(props: DivProps) {
  const { className, asChild, ...itemProps } = props;

  const ItemPrimitive = asChild ? Slot : "div";

  return (
    <ItemPrimitive
      data-slot="marquee-item"
      {...itemProps}
      className={cn("shrink-0", className)}
    />
  );
}

const marqueeEdgeVariants = cva("pointer-events-none absolute z-10", {
  variants: {
    side: {
      left: "top-0 left-0 h-full w-1/3 bg-gradient-to-r from-background to-transparent",
      right:
        "top-0 right-0 h-full w-1/3 bg-gradient-to-l from-background to-transparent",
      top: "top-0 left-0 h-1/3 w-full bg-gradient-to-b from-background to-transparent",
      bottom:
        "bottom-0 left-0 h-1/3 w-full bg-gradient-to-t from-background to-transparent",
    },
  },
});

interface MarqueeEdgeProps
  extends VariantProps<typeof marqueeEdgeVariants>,
    DivProps {}

function MarqueeEdge(props: MarqueeEdgeProps) {
  const { side, className, asChild, ...edgeProps } = props;

  const EdgePrimitive = asChild ? Slot : "div";

  return (
    <EdgePrimitive
      data-slot="marquee-edge"
      {...edgeProps}
      className={cn(marqueeEdgeVariants({ side, className }))}
    />
  );
}

export {
  MarqueeRoot as Marquee,
  MarqueeContent as Content,
  MarqueeItem as Item,
  MarqueeEdge as Edge,
  //
  MarqueeRoot as Root,
  MarqueeContent,
  MarqueeItem,
  MarqueeEdge,
};
