"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import * as React from "react";

const DATA_TOP_SCROLL = "data-top-scroll";
const DATA_BOTTOM_SCROLL = "data-bottom-scroll";
const DATA_LEFT_SCROLL = "data-left-scroll";
const DATA_RIGHT_SCROLL = "data-right-scroll";
const DATA_TOP_BOTTOM_SCROLL = "data-top-bottom-scroll";
const DATA_LEFT_RIGHT_SCROLL = "data-left-right-scroll";

type ScrollDirection = "up" | "down" | "left" | "right";

type ScrollVisibility = {
  [key in ScrollDirection]: boolean;
};

const scrollerVariants = cva("", {
  variants: {
    orientation: {
      vertical: [
        "overflow-y-auto",
        "data-[top-scroll=true]:[mask-image:linear-gradient(0deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[top-bottom-scroll=true]:[mask-image:linear-gradient(#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
      ],
      horizontal: [
        "overflow-x-auto",
        "data-[left-scroll=true]:[mask-image:linear-gradient(270deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[left-right-scroll=true]:[mask-image:linear-gradient(to_right,#000,#000,transparent_0,#000_var(--scroll-shadow-size),#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
      ],
    },
    hideScrollbar: {
      true: "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
      false: "",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    hideScrollbar: false,
  },
});

interface ScrollerProps
  extends VariantProps<typeof scrollerVariants>,
    React.ComponentPropsWithoutRef<"div"> {
  size?: number;
  offset?: number;
  scrollStep?: number;
  asChild?: boolean;
  withNavigation?: boolean;
}

const Scroller = React.forwardRef<HTMLDivElement, ScrollerProps>(
  (props, forwardedRef) => {
    const {
      orientation = "vertical",
      hideScrollbar,
      className,
      size = 40,
      offset = 0,
      scrollStep = 40,
      style,
      asChild,
      withNavigation = false,
      ...scrollerProps
    } = props;

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const [scrollVisibility, setScrollVisibility] =
      React.useState<ScrollVisibility>({
        up: false,
        down: false,
        left: false,
        right: false,
      });

    const onScrollBy = React.useCallback(
      (direction: ScrollDirection) => {
        const container = containerRef.current;
        if (!container) return;

        const scrollMap: Record<ScrollDirection, () => void> = {
          up: () => (container.scrollTop -= scrollStep),
          down: () => (container.scrollTop += scrollStep),
          left: () => (container.scrollLeft -= scrollStep),
          right: () => (container.scrollLeft += scrollStep),
        };

        scrollMap[direction]();
      },
      [scrollStep],
    );

    React.useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      function onScroll() {
        if (!container) return;

        const isVertical = orientation === "vertical";

        if (isVertical) {
          const { scrollTop, clientHeight, scrollHeight } = container;
          const hasTopScroll = scrollTop > offset;
          const hasBottomScroll =
            scrollTop + clientHeight + offset < scrollHeight;
          const isVerticallyScrollable = scrollHeight > clientHeight;

          setScrollVisibility((prev) => ({
            ...prev,
            up: scrollTop > offset,
            down: scrollTop + clientHeight < scrollHeight,
          }));

          if (hasTopScroll && hasBottomScroll && isVerticallyScrollable) {
            container.setAttribute(DATA_TOP_BOTTOM_SCROLL, "true");
            container.removeAttribute(DATA_TOP_SCROLL);
            container.removeAttribute(DATA_BOTTOM_SCROLL);
          } else {
            container.removeAttribute(DATA_TOP_BOTTOM_SCROLL);
            container.toggleAttribute(DATA_TOP_SCROLL, hasTopScroll);
            container.toggleAttribute(
              DATA_BOTTOM_SCROLL,
              hasBottomScroll && isVerticallyScrollable,
            );
          }
        }

        const { scrollLeft, clientWidth, scrollWidth } = container;
        const hasLeftScroll = scrollLeft > offset;
        const hasRightScroll = scrollLeft + clientWidth + offset < scrollWidth;
        const isHorizontallyScrollable = scrollWidth > clientWidth;

        setScrollVisibility((prev) => ({
          ...prev,
          left: scrollLeft > offset,
          right: scrollLeft + clientWidth < scrollWidth,
        }));

        if (hasLeftScroll && hasRightScroll && isHorizontallyScrollable) {
          container.setAttribute(DATA_LEFT_RIGHT_SCROLL, "true");
          container.removeAttribute(DATA_LEFT_SCROLL);
          container.removeAttribute(DATA_RIGHT_SCROLL);
        } else {
          container.removeAttribute(DATA_LEFT_RIGHT_SCROLL);
          container.toggleAttribute(DATA_LEFT_SCROLL, hasLeftScroll);
          container.toggleAttribute(
            DATA_RIGHT_SCROLL,
            hasRightScroll && isHorizontallyScrollable,
          );
        }
      }

      onScroll();
      container.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onScroll);

      return () => {
        container.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [orientation, offset]);

    const composedStyle = React.useMemo<React.CSSProperties>(
      () => ({
        "--scroll-shadow-size": `${size}px`,
        ...style,
      }),
      [size, style],
    );

    const Comp = asChild ? Slot : "div";

    const activeDirections = React.useMemo<ScrollDirection[]>(
      () => (orientation === "vertical" ? ["up", "down"] : ["left", "right"]),
      [orientation],
    );

    return (
      <div className="relative w-fit">
        {withNavigation &&
          activeDirections.map(
            (direction) =>
              scrollVisibility[direction] && (
                <ScrollButton
                  key={direction}
                  direction={direction}
                  onClick={() => onScrollBy(direction)}
                />
              ),
          )}
        <Comp
          {...scrollerProps}
          ref={composedRef}
          style={composedStyle}
          className={cn(
            scrollerVariants({ orientation, hideScrollbar, className }),
          )}
        />
      </div>
    );
  },
);
Scroller.displayName = "Scroller";

const scrollButtonVariants = cva(
  "absolute z-10 transition-opacity [&>svg]:size-4 [&>svg]:opacity-80 hover:[&>svg]:opacity-100",
  {
    variants: {
      direction: {
        up: "-translate-x-1/2 top-0 left-1/2",
        down: "-translate-x-1/2 bottom-0 left-1/2",
        left: "-translate-y-1/2 top-1/2 left-0",
        right: "-translate-y-1/2 top-1/2 right-0",
      },
    },
    defaultVariants: {
      direction: "up",
    },
  },
);

const directionToIcon: Record<ScrollDirection, React.ElementType> = {
  up: ChevronUp,
  down: ChevronDown,
  left: ChevronLeft,
  right: ChevronRight,
} as const;

interface ScrollButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  direction: ScrollDirection;
}

const ScrollButton = React.forwardRef<HTMLButtonElement, ScrollButtonProps>(
  (props, forwardedRef) => {
    const { onClick, direction, className, ...buttonProps } = props;
    const [autoScrollTimer, setAutoScrollTimer] = React.useState<number | null>(
      null,
    );

    const startAutoScroll = React.useCallback(() => {
      if (autoScrollTimer === null) {
        const timer = window.setInterval(onClick ?? (() => {}), 50);
        setAutoScrollTimer(timer);
      }
    }, [autoScrollTimer, onClick]);

    const stopAutoScroll = React.useCallback(() => {
      if (autoScrollTimer !== null) {
        window.clearInterval(autoScrollTimer);
        setAutoScrollTimer(null);
      }
    }, [autoScrollTimer]);

    React.useEffect(() => {
      return () => stopAutoScroll();
    }, [stopAutoScroll]);

    const Icon = directionToIcon[direction];

    return (
      <button
        type="button"
        {...buttonProps}
        ref={forwardedRef}
        onPointerDown={startAutoScroll}
        onPointerUp={stopAutoScroll}
        onPointerLeave={stopAutoScroll}
        onClick={onClick}
        className={scrollButtonVariants({ direction, className })}
      >
        <Icon />
      </button>
    );
  },
);
ScrollButton.displayName = "ScrollButton";

export { Scroller };
