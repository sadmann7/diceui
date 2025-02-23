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

type ScrollDirection = "up" | "down" | "left" | "right";

interface ScrollerProps
  extends VariantProps<typeof scrollerVariants>,
    React.ComponentPropsWithoutRef<"div"> {
  size?: number;
  offset?: number;
  asChild?: boolean;
  withNavigation?: boolean;
  scrollStep?: number;
}

const Scroller = React.forwardRef<HTMLDivElement, ScrollerProps>(
  (props, forwardedRef) => {
    const {
      orientation = "vertical",
      hideScrollbar,
      className,
      size = 40,
      offset = 0,
      style,
      asChild,
      withNavigation = false,
      scrollStep = 40,
      ...scrollerProps
    } = props;

    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const [canScrollUp, setCanScrollUp] = React.useState(false);
    const [canScrollDown, setCanScrollDown] = React.useState(false);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    const updateScrollButtons = React.useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      if (orientation === "vertical") {
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;

        setCanScrollUp(scrollTop > 0);
        setCanScrollDown(scrollTop + clientHeight < scrollHeight);
      } else {
        const scrollLeft = container.scrollLeft;
        const clientWidth = container.clientWidth;
        const scrollWidth = container.scrollWidth;

        setCanScrollLeft(scrollLeft > 0);
        setCanScrollRight(scrollLeft + clientWidth < scrollWidth);
      }
    }, [orientation]);

    const onScroll = React.useCallback(
      (direction: ScrollDirection) => {
        const container = containerRef.current;
        if (!container) return;

        if (direction === "up") container.scrollTop -= scrollStep;
        else if (direction === "down") container.scrollTop += scrollStep;
        else if (direction === "left") container.scrollLeft -= scrollStep;
        else if (direction === "right") container.scrollLeft += scrollStep;
      },
      [scrollStep],
    );

    React.useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      function onScroll() {
        if (!container) return;

        const isVertical = orientation === "vertical";
        const isHorizontal = orientation === "horizontal";

        // Update scroll buttons visibility
        if (isVertical && withNavigation) {
          updateScrollButtons();
        }

        // Vertical scroll state
        if (isVertical) {
          const scrollTop = container.scrollTop;
          const clientHeight = container.clientHeight;
          const scrollHeight = container.scrollHeight;

          const hasTopScroll = scrollTop > offset;
          const hasBottomScroll =
            scrollTop + clientHeight + offset < scrollHeight;
          const isVerticallyScrollable = scrollHeight > clientHeight;

          if (hasTopScroll && hasBottomScroll && isVerticallyScrollable) {
            container.setAttribute(DATA_TOP_BOTTOM_SCROLL, "true");
            container.removeAttribute(DATA_TOP_SCROLL);
            container.removeAttribute(DATA_BOTTOM_SCROLL);
          } else {
            container.removeAttribute(DATA_TOP_BOTTOM_SCROLL);
            if (hasTopScroll) container.setAttribute(DATA_TOP_SCROLL, "true");
            else container.removeAttribute(DATA_TOP_SCROLL);
            if (hasBottomScroll && isVerticallyScrollable)
              container.setAttribute(DATA_BOTTOM_SCROLL, "true");
            else container.removeAttribute(DATA_BOTTOM_SCROLL);
          }
        }

        // Horizontal scroll state
        if (isHorizontal) {
          const scrollLeft = container.scrollLeft;
          const clientWidth = container.clientWidth;
          const scrollWidth = container.scrollWidth;

          const hasLeftScroll = scrollLeft > offset;
          const hasRightScroll =
            scrollLeft + clientWidth + offset < scrollWidth;
          const isHorizontallyScrollable = scrollWidth > clientWidth;

          if (hasLeftScroll && hasRightScroll && isHorizontallyScrollable) {
            container.setAttribute(DATA_LEFT_RIGHT_SCROLL, "true");
            container.removeAttribute(DATA_LEFT_SCROLL);
            container.removeAttribute(DATA_RIGHT_SCROLL);
          } else {
            container.removeAttribute(DATA_LEFT_RIGHT_SCROLL);
            if (hasLeftScroll) container.setAttribute(DATA_LEFT_SCROLL, "true");
            else container.removeAttribute(DATA_LEFT_SCROLL);
            if (hasRightScroll && isHorizontallyScrollable)
              container.setAttribute(DATA_RIGHT_SCROLL, "true");
            else container.removeAttribute(DATA_RIGHT_SCROLL);
          }
        }
      }

      onScroll();
      container.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onScroll);

      return () => {
        container.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      };
    }, [orientation, offset, withNavigation, updateScrollButtons]);

    const composedStyle = React.useMemo<React.CSSProperties>(
      () => ({
        "--scroll-shadow-size": `${size}px`,
        ...style,
      }),
      [size, style],
    );

    const Comp = asChild ? Slot : "div";

    return (
      <Comp
        {...scrollerProps}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          scrollerVariants({ orientation, hideScrollbar }),
          withNavigation && orientation === "horizontal" && "px-8",
          className,
        )}
      />
    );
  },
);
Scroller.displayName = "Scroller";

interface ScrollButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  direction: "up" | "down" | "left" | "right";
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

    return (
      <button
        type="button"
        {...buttonProps}
        ref={forwardedRef}
        onPointerDown={startAutoScroll}
        onPointerUp={stopAutoScroll}
        onPointerLeave={stopAutoScroll}
        onClick={onClick}
        className={cn("[&>svg]:size-4", className)}
      >
        {direction === "up" ? (
          <ChevronUp />
        ) : direction === "down" ? (
          <ChevronDown />
        ) : direction === "left" ? (
          <ChevronLeft />
        ) : (
          <ChevronRight />
        )}
      </button>
    );
  },
);
ScrollButton.displayName = "ScrollButton";

export { Scroller };
