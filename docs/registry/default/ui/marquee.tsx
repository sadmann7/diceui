"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

type Direction = "left" | "right" | "up" | "down";
type Orientation = "horizontal" | "vertical";

type RootElement = React.ComponentRef<typeof MarqueeRoot>;
type ContentElement = React.ComponentRef<typeof MarqueeContent>;

interface DivProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface MarqueeContextValue {
  direction: Direction;
  pauseOnHover: boolean;
  reverse: boolean;
  orientation: Orientation;
  loopCount: number;
  contentRef: React.RefObject<ContentElement | null>;
}

const MarqueeContext = React.createContext<MarqueeContextValue | null>(null);

function useMarqueeContext() {
  const context = React.useContext(MarqueeContext);
  if (!context) {
    throw new Error("Marquee components must be used within a Marquee");
  }
  return context;
}

interface MarqueeRootProps extends DivProps {
  direction?: Direction;
  orientation?: Orientation;
  pauseOnHover?: boolean;
  reverse?: boolean;
  speed?: number;
  loopCount?: number;
}

function MarqueeRoot(props: MarqueeRootProps) {
  const {
    direction = "left",
    orientation = direction === "up" || direction === "down"
      ? "vertical"
      : "horizontal",
    speed = 50,
    loopCount = 2,
    pauseOnHover = false,
    reverse = false,
    className,
    style,
    children,
    asChild,
    ref,
    ...marqueeProps
  } = props;

  const rootRef = React.useRef<RootElement>(null);
  const contentRef = React.useRef<ContentElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const [duration, setDuration] = React.useState(40);

  React.useEffect(() => {
    function updateDuration() {
      if (!rootRef.current || !contentRef.current) return;

      const container = rootRef.current;
      const firstContent = contentRef.current;

      const containerSize =
        orientation === "vertical"
          ? container.offsetHeight
          : container.offsetWidth;
      const contentSize =
        orientation === "vertical"
          ? firstContent.offsetHeight
          : firstContent.offsetWidth;

      const distance = contentSize + containerSize;
      const calculatedDuration = distance / speed;

      setDuration(calculatedDuration);
    }

    updateDuration();

    if (typeof ResizeObserver !== "undefined") {
      const resizeObserver = new ResizeObserver(updateDuration);
      if (rootRef.current) {
        resizeObserver.observe(rootRef.current);
      }
      if (contentRef.current) {
        resizeObserver.observe(contentRef.current);
      }

      return () => resizeObserver.disconnect();
    }

    return undefined;
  }, [speed, orientation]);

  const marqueeStyle = React.useMemo<React.CSSProperties>(
    () => ({
      "--duration": `${duration}s`,
      "--gap": "1rem",
      ...style,
    }),
    [duration, style],
  );

  const contextValue = React.useMemo<MarqueeContextValue>(
    () => ({
      direction,
      pauseOnHover,
      reverse,
      orientation: orientation ?? "horizontal",
      loopCount,
      contentRef,
    }),
    [direction, pauseOnHover, reverse, orientation, loopCount],
  );

  const MarqueePrimitive = asChild ? Slot : "div";

  return (
    <MarqueeContext.Provider value={contextValue}>
      <MarqueePrimitive
        data-slot="marquee"
        {...marqueeProps}
        ref={composedRef}
        style={marqueeStyle}
        className={cn(
          "relative flex overflow-hidden [--duration:40s] [--gap:1rem]",
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

const marqueeContentVariants = cva(
  "flex shrink-0 animate-marquee justify-around [gap:var(--gap)]",
  {
    variants: {
      direction: {
        left: "animate-marquee-left [margin-right:var(--gap)]",
        right: "animate-marquee-right [margin-left:var(--gap)]",
        up: "animate-marquee-up flex-col [margin-bottom:var(--gap)]",
        down: "animate-marquee-down flex-col [margin-top:var(--gap)]",
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
      direction: "left",
      pauseOnHover: false,
      reverse: false,
    },
  },
);

function MarqueeContent(props: DivProps) {
  const { className, asChild, ref, ...contentProps } = props;
  const { direction, pauseOnHover, reverse, loopCount, contentRef } =
    useMarqueeContext();

  const composedRef = useComposedRefs(ref, contentRef);
  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <>
      {Array.from({ length: loopCount }).map((_, index) => (
        <ContentPrimitive
          key={index}
          data-slot="marquee-content"
          {...contentProps}
          ref={index === 0 ? composedRef : undefined}
          className={cn(
            marqueeContentVariants({
              direction,
              pauseOnHover,
              reverse,
              className,
            }),
          )}
        />
      ))}
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

const marqueeFadeVariants = cva("pointer-events-none absolute z-10", {
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

interface MarqueeFadeProps
  extends VariantProps<typeof marqueeFadeVariants>,
    DivProps {}

function MarqueeFade(props: MarqueeFadeProps) {
  const { side, className, asChild, ...fadeProps } = props;

  const FadePrimitive = asChild ? Slot : "div";

  return (
    <FadePrimitive
      data-slot="marquee-fade"
      {...fadeProps}
      className={cn(marqueeFadeVariants({ side, className }))}
    />
  );
}

export {
  MarqueeRoot as Root,
  MarqueeContent as Content,
  MarqueeItem as Item,
  MarqueeFade as Fade,
  //
  MarqueeRoot as Marquee,
  MarqueeContent,
  MarqueeItem,
  MarqueeFade,
};
