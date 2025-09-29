"use client";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const marqueeVariants = cva(
  "relative flex overflow-hidden [--duration:40s] [--gap:1rem]",
  {
    variants: {
      orientation: {
        vertical: "h-full flex-col",
        horizontal: "w-full",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
    },
  },
);

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

interface MarqueeContextValue {
  direction: "left" | "right" | "up" | "down";
  pauseOnHover: boolean;
  reverse: boolean;
  orientation: "horizontal" | "vertical";
  loopCount: number;
}

const MarqueeContext = React.createContext<MarqueeContextValue | null>(null);

function useMarqueeContext() {
  const context = React.useContext(MarqueeContext);
  if (!context) {
    throw new Error("Marquee components must be used within a Marquee");
  }
  return context;
}

interface MarqueeRootProps
  extends VariantProps<typeof marqueeVariants>,
    React.ComponentProps<"div"> {
  direction?: "left" | "right" | "up" | "down";
  pauseOnHover?: boolean;
  reverse?: boolean;
  speed?: number;
  loopCount?: number;
  asChild?: boolean;
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

  const containerRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, containerRef);
  const [duration, setDuration] = React.useState(40);

  React.useEffect(() => {
    const updateDuration = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const firstContent = container.querySelector(
        "[data-marquee-content]",
      ) as HTMLElement;

      if (!firstContent) return;

      const containerSize =
        orientation === "vertical"
          ? container.offsetHeight
          : container.offsetWidth;
      const contentSize =
        orientation === "vertical"
          ? firstContent.offsetHeight
          : firstContent.offsetWidth;

      // Calculate duration based on speed (pixels per second)
      const distance = contentSize + containerSize;
      const calculatedDuration = distance / speed;

      setDuration(calculatedDuration);
    };

    updateDuration();

    const resizeObserver = new ResizeObserver(updateDuration);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
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
    }),
    [direction, pauseOnHover, reverse, orientation, loopCount],
  );

  const MarqueePrimitive = asChild ? Slot : "div";

  return (
    <MarqueeContext.Provider value={contextValue}>
      <MarqueePrimitive
        ref={composedRef}
        {...marqueeProps}
        style={marqueeStyle}
        className={cn(
          marqueeVariants({ orientation }),
          pauseOnHover && "group",
          className,
        )}
      >
        {children}
      </MarqueePrimitive>
    </MarqueeContext.Provider>
  );
}

interface MarqueeContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MarqueeContent(props: MarqueeContentProps) {
  const { className, children, asChild, ...contentProps } = props;
  const { direction, pauseOnHover, reverse, loopCount } = useMarqueeContext();

  const ContentPrimitive = asChild ? Slot : "div";

  return (
    <>
      {Array.from({ length: loopCount }).map((_, index) => (
        <ContentPrimitive
          key={index}
          data-marquee-content
          {...contentProps}
          className={cn(
            marqueeContentVariants({
              direction,
              pauseOnHover,
              reverse,
            }),
            className,
          )}
        >
          {children}
        </ContentPrimitive>
      ))}
    </>
  );
}

interface MarqueeItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

function MarqueeItem(props: MarqueeItemProps) {
  const { className, asChild, ...itemProps } = props;

  const ItemPrimitive = asChild ? Slot : "div";

  return <ItemPrimitive {...itemProps} className={cn("shrink-0", className)} />;
}

interface MarqueeFadeProps extends React.ComponentProps<"div"> {
  side: "left" | "right" | "top" | "bottom";
  asChild?: boolean;
}

function MarqueeFade(props: MarqueeFadeProps) {
  const { side, className, asChild, ...fadeProps } = props;

  const FadePrimitive = asChild ? Slot : "div";

  return (
    <FadePrimitive
      {...fadeProps}
      className={cn(marqueeFadeVariants({ side }), className)}
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
