"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

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
      mixed: [
        "overflow-auto",
        "data-[right-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[bottom-scroll=true]:[mask-image:linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[right-bottom-scroll=true]:[mask-image:linear-gradient(90deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent),linear-gradient(180deg,#000_calc(100%_-_var(--scroll-shadow-size)),transparent)]",
        "data-[right-bottom-scroll=true]:[mask-composite:intersect]",
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
        const isMixed = orientation === "mixed";

        // Vertical scroll state
        if (isVertical || isMixed) {
          const scrollTop = element.scrollTop;
          const clientHeight = element.clientHeight;
          const scrollHeight = element.scrollHeight;

          const hasTopScroll = scrollTop > offset;
          const hasBottomScroll =
            scrollTop + clientHeight + offset < scrollHeight;
          const isVerticallyScrollable = scrollHeight > clientHeight;

          if (!isMixed) {
            if (hasTopScroll && hasBottomScroll && isVerticallyScrollable) {
              element.dataset.topBottomScroll = "true";
              element.removeAttribute("data-top-scroll");
              element.removeAttribute("data-bottom-scroll");
            } else {
              element.removeAttribute("data-top-bottom-scroll");
              if (hasTopScroll) element.dataset.topScroll = "true";
              else element.removeAttribute("data-top-scroll");
              if (hasBottomScroll && isVerticallyScrollable)
                element.dataset.bottomScroll = "true";
              else element.removeAttribute("data-bottom-scroll");
            }
          } else if (hasBottomScroll && isVerticallyScrollable) {
            element.dataset.bottomScroll = "true";
          } else {
            element.removeAttribute("data-bottom-scroll");
          }
        }

        // Horizontal scroll state
        if (isHorizontal || isMixed) {
          const scrollLeft = element.scrollLeft;
          const clientWidth = element.clientWidth;
          const scrollWidth = element.scrollWidth;

          const hasLeftScroll = scrollLeft > offset;
          const hasRightScroll =
            scrollLeft + clientWidth + offset < scrollWidth;
          const isHorizontallyScrollable = scrollWidth > clientWidth;

          if (!isMixed) {
            if (hasLeftScroll && hasRightScroll && isHorizontallyScrollable) {
              element.dataset.leftRightScroll = "true";
              element.removeAttribute("data-left-scroll");
              element.removeAttribute("data-right-scroll");
            } else {
              element.removeAttribute("data-left-right-scroll");
              if (hasLeftScroll) element.dataset.leftScroll = "true";
              else element.removeAttribute("data-left-scroll");
              if (hasRightScroll && isHorizontallyScrollable)
                element.dataset.rightScroll = "true";
              else element.removeAttribute("data-right-scroll");
            }
          } else if (hasRightScroll && isHorizontallyScrollable) {
            element.dataset.rightScroll = "true";
          } else {
            element.removeAttribute("data-right-scroll");
          }
        }

        // Mixed scroll state
        if (isMixed) {
          const hasRightScroll = element.hasAttribute("data-right-scroll");
          const hasBottomScroll = element.hasAttribute("data-bottom-scroll");

          if (hasRightScroll && hasBottomScroll) {
            element.dataset.rightBottomScroll = "true";
            element.removeAttribute("data-right-scroll");
            element.removeAttribute("data-bottom-scroll");
          } else {
            element.removeAttribute("data-right-bottom-scroll");
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
