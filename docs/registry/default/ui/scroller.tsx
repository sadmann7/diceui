"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
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

interface ScrollerProps
  extends VariantProps<typeof scrollerVariants>,
    React.ComponentPropsWithoutRef<"div"> {
  size?: number;
  offset?: number;
  asChild?: boolean;
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
      ...scrollerProps
    } = props;

    const ref = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, ref);

    React.useEffect(() => {
      const element = ref.current;
      if (!element) return;

      function onScroll() {
        if (!element) return;

        const isVertical = orientation === "vertical";
        const isHorizontal = orientation === "horizontal";

        // Vertical scroll state
        if (isVertical) {
          const scrollTop = element.scrollTop;
          const clientHeight = element.clientHeight;
          const scrollHeight = element.scrollHeight;

          const hasTopScroll = scrollTop > offset;
          const hasBottomScroll =
            scrollTop + clientHeight + offset < scrollHeight;
          const isVerticallyScrollable = scrollHeight > clientHeight;

          if (hasTopScroll && hasBottomScroll && isVerticallyScrollable) {
            element.setAttribute(DATA_TOP_BOTTOM_SCROLL, "true");
            element.removeAttribute(DATA_TOP_SCROLL);
            element.removeAttribute(DATA_BOTTOM_SCROLL);
          } else {
            element.removeAttribute(DATA_TOP_BOTTOM_SCROLL);
            if (hasTopScroll) element.setAttribute(DATA_TOP_SCROLL, "true");
            else element.removeAttribute(DATA_TOP_SCROLL);
            if (hasBottomScroll && isVerticallyScrollable)
              element.setAttribute(DATA_BOTTOM_SCROLL, "true");
            else element.removeAttribute(DATA_BOTTOM_SCROLL);
          }
        }

        // Horizontal scroll state
        if (isHorizontal) {
          const scrollLeft = element.scrollLeft;
          const clientWidth = element.clientWidth;
          const scrollWidth = element.scrollWidth;

          const hasLeftScroll = scrollLeft > offset;
          const hasRightScroll =
            scrollLeft + clientWidth + offset < scrollWidth;
          const isHorizontallyScrollable = scrollWidth > clientWidth;

          if (hasLeftScroll && hasRightScroll && isHorizontallyScrollable) {
            element.setAttribute(DATA_LEFT_RIGHT_SCROLL, "true");
            element.removeAttribute(DATA_LEFT_SCROLL);
            element.removeAttribute(DATA_RIGHT_SCROLL);
          } else {
            element.removeAttribute(DATA_LEFT_RIGHT_SCROLL);
            if (hasLeftScroll) element.setAttribute(DATA_LEFT_SCROLL, "true");
            else element.removeAttribute(DATA_LEFT_SCROLL);
            if (hasRightScroll && isHorizontallyScrollable)
              element.setAttribute(DATA_RIGHT_SCROLL, "true");
            else element.removeAttribute(DATA_RIGHT_SCROLL);
          }
        }
      }

      onScroll();
      element.addEventListener("scroll", onScroll);
      window.addEventListener("resize", onScroll);

      return () => {
        element.removeEventListener("scroll", onScroll);
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

    return (
      <Comp
        {...scrollerProps}
        ref={composedRef}
        style={composedStyle}
        className={cn(
          scrollerVariants({ orientation, hideScrollbar, className }),
        )}
      />
    );
  },
);

Scroller.displayName = "Scroller";

export { Scroller };
