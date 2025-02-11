"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "MasonryRoot";
const ITEM_NAME = "MasonryItem";

const COLUMN_COUNT = 4;
const GAP = 12;

const MASONRY_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

const TAILWIND_BREAKPOINTS = {
  initial: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

type TailwindBreakpoint = keyof typeof TAILWIND_BREAKPOINTS;
type BreakpointValue = TailwindBreakpoint | number;
type ResponsiveObject = Partial<Record<BreakpointValue, number>>;
type ResponsiveValue = number | ResponsiveObject;

function parseBreakpoint(breakpoint: BreakpointValue): number {
  if (typeof breakpoint === "number") return breakpoint;
  return breakpoint in TAILWIND_BREAKPOINTS
    ? TAILWIND_BREAKPOINTS[breakpoint]
    : Number(breakpoint);
}

function getInitialValue(value: ResponsiveValue, defaultValue: number): number {
  if (typeof value === "number") return value;
  if ("initial" in value) return value.initial ?? defaultValue;

  const breakpoints = Object.entries(value)
    .map(([key, val]) => ({
      breakpoint: parseBreakpoint(key as BreakpointValue),
      value: val ?? defaultValue,
    }))
    .sort((a, b) => a.breakpoint - b.breakpoint);

  return breakpoints[0]?.value ?? defaultValue;
}

function useResponsiveValue({
  value,
  defaultValue,
  mounted,
}: {
  value: ResponsiveValue;
  defaultValue: number;
  mounted: boolean;
}): number {
  const initialValue = React.useMemo(
    () => getInitialValue(value, defaultValue),
    [value, defaultValue],
  );
  const [currentValue, setCurrentValue] = React.useState(initialValue);

  const onResize = React.useCallback(() => {
    if (!mounted) return;
    if (typeof value === "number") {
      setCurrentValue(value);
      return;
    }

    const width = window.innerWidth;
    const breakpoints = Object.entries(value)
      .map(([key, val]) => ({
        breakpoint:
          key === "initial" ? 0 : parseBreakpoint(key as BreakpointValue),
        value: val ?? defaultValue,
      }))
      .sort((a, b) => b.breakpoint - a.breakpoint);

    const newValue =
      breakpoints.find(({ breakpoint }) => width >= breakpoint)?.value ??
      defaultValue;
    setCurrentValue(newValue);
  }, [value, defaultValue, mounted]);

  React.useEffect(() => {
    if (!mounted) return;

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize, mounted]);

  return currentValue;
}

interface MasonryContextValue {
  mounted: boolean;
  columnCount: number;
  gap: number;
}

const MasonryContext = React.createContext<MasonryContextValue | null>(null);
MasonryContext.displayName = ROOT_NAME;

function useMasonryContext(name: keyof typeof MASONRY_ERROR) {
  const context = React.useContext(MasonryContext);
  if (!context) {
    throw new Error(MASONRY_ERROR[name]);
  }
  return context;
}

interface MasonryItemProps extends React.ComponentPropsWithoutRef<"div"> {
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLElement>;
}

type VisibleItem = React.ReactElement<MasonryItemProps>;

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: number | ResponsiveObject;
  defaultColumnCount?: number;
  gap?: number | ResponsiveObject;
  defaultGap?: number;
  linear?: boolean;
  asChild?: boolean;
  overscanBy?: number;
  scrollingDelay?: number;
  itemHeight?: number;
}

// Create mutable refs for caches
const createCache = () => {
  return {
    measurements: new WeakMap<HTMLElement, { width: number; height: number }>(),
    positions: new WeakMap<HTMLElement, { top: number; left: number }>(),
  };
};

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnCount = COLUMN_COUNT,
      defaultColumnCount = typeof columnCount === "number"
        ? columnCount
        : COLUMN_COUNT,
      gap = GAP,
      defaultGap = typeof gap === "number" ? gap : GAP,
      linear = false,
      asChild,
      className,
      style,
      overscanBy = 2,
      scrollingDelay = 150,
      itemHeight = 300,
      ...rootProps
    } = props;

    const [mounted, setMounted] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const resizeObserver = React.useRef<ResizeObserver | null>(null);
    const [items, setItems] = React.useState<VisibleItem[]>([]);
    const [maxHeight, setMaxHeight] = React.useState(0);
    const itemRefs = React.useRef<Map<number, HTMLElement>>(new Map());
    const cacheRef = React.useRef(createCache());
    const isScrolling = React.useRef(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

    // Track visible range for virtualization
    const [visibleRange, setVisibleRange] = React.useState({
      start: 0,
      end: 0,
    });

    React.useLayoutEffect(() => {
      setMounted(true);
      return () => {
        itemRefs.current = new Map();
        cacheRef.current = createCache();
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      };
    }, []);

    const currentColumnCount = useResponsiveValue({
      value: columnCount,
      defaultValue: defaultColumnCount,
      mounted,
    });

    const currentGap = useResponsiveValue({
      value: gap,
      defaultValue: defaultGap,
      mounted,
    });

    // Improved column width calculation
    const getColumnWidth = React.useCallback(() => {
      if (!containerRef.current) return 0;
      const containerWidth = containerRef.current.offsetWidth;
      const totalGap = currentGap * (currentColumnCount - 1);
      return Math.floor((containerWidth - totalGap) / currentColumnCount);
    }, [currentColumnCount, currentGap]);

    // Optimized layout calculation with virtualization
    const calculateLayout = React.useCallback(() => {
      if (!mounted || !containerRef.current) return;

      const columnWidth = getColumnWidth();
      const columnHeights = new Array(currentColumnCount).fill(0);
      const newItems: VisibleItem[] = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportTop = window.scrollY - containerRect.top;
      const viewportBottom = viewportTop + window.innerHeight;
      const overscanAmount = overscanBy * window.innerHeight;

      // Update visible range for virtualization
      const estimatedItemsInView =
        Math.ceil(window.innerHeight / itemHeight) * currentColumnCount;
      const start = Math.max(
        0,
        Math.floor((viewportTop - overscanAmount) / itemHeight) *
          currentColumnCount,
      );
      const end = Math.min(
        React.Children.count(children),
        Math.ceil((viewportBottom + overscanAmount) / itemHeight) *
          currentColumnCount,
      );

      setVisibleRange({ start, end });

      React.Children.forEach(children, (child, index) => {
        if (!React.isValidElement<MasonryItemProps>(child)) return;
        if (index < start || index > end) return;

        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights),
        );
        const left = Math.round(
          shortestColumnIndex * (columnWidth + currentGap),
        );
        const top = columnHeights[shortestColumnIndex];

        let height = itemHeight;
        const element = itemRefs.current.get(index);

        if (element) {
          const cached = cacheRef.current.measurements.get(element);
          if (cached && cached.width === columnWidth) {
            height = cached.height;
          } else {
            height = element.offsetHeight;
            cacheRef.current.measurements.set(element, {
              width: columnWidth,
              height,
            });
          }
        }

        columnHeights[shortestColumnIndex] += height + currentGap;

        const itemProps: MasonryItemProps = {
          ref: (el: HTMLElement | null) => {
            if (el) {
              itemRefs.current.set(index, el);
              if (child.props.ref) {
                if (typeof child.props.ref === "function") {
                  child.props.ref(el);
                } else if (child.props.ref) {
                  (
                    child.props.ref as React.MutableRefObject<HTMLElement>
                  ).current = el;
                }
              }
            }
          },
          style: {
            position: "absolute",
            top,
            left,
            width: columnWidth,
            transform: "translateZ(0)",
            willChange: isScrolling.current ? "transform" : undefined,
            visibility: height === 0 ? "hidden" : undefined,
            ...child.props.style,
          },
        };

        newItems.push(React.cloneElement(child, itemProps));
      });

      setItems(newItems);
      setMaxHeight(Math.max(...columnHeights));
    }, [
      children,
      currentColumnCount,
      currentGap,
      mounted,
      itemHeight,
      overscanBy,
    ]);

    // Handle scroll events for virtualization
    React.useEffect(() => {
      const onScroll = () => {
        isScrolling.current = true;
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);

        scrollTimeout.current = setTimeout(() => {
          isScrolling.current = false;
          calculateLayout();
        }, scrollingDelay);

        calculateLayout();
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }, [calculateLayout, scrollingDelay]);

    // Handle resize events
    React.useEffect(() => {
      if (!mounted) return;

      const resizeObserver = new ResizeObserver((entries) => {
        calculateLayout();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      return () => resizeObserver.disconnect();
    }, [mounted, calculateLayout]);

    // Initial layout calculation
    React.useEffect(() => {
      calculateLayout();
    }, [calculateLayout]);

    const RootSlot = asChild ? Slot : "div";

    return (
      <MasonryContext.Provider
        value={{
          mounted,
          columnCount: currentColumnCount,
          gap: currentGap,
        }}
      >
        <RootSlot
          {...rootProps}
          ref={composedRef}
          className={cn("relative mx-auto w-full", className)}
          style={{
            ...style,
            height: maxHeight,
            position: "relative",
          }}
        >
          {items}
        </RootSlot>
      </MasonryContext.Provider>
    );
  },
);

Masonry.displayName = ROOT_NAME;

interface MasonryItemProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  fallback?: React.ReactNode;
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { asChild, fallback, ...itemProps } = props;
    const context = useMasonryContext(ITEM_NAME);

    if (!context.mounted && fallback) {
      return fallback;
    }

    const ItemSlot = asChild ? Slot : "div";

    return <ItemSlot {...itemProps} ref={forwardedRef} />;
  },
);

MasonryItem.displayName = ITEM_NAME;

const Root = Masonry;
const Item = MasonryItem;

export {
  Masonry,
  MasonryItem,
  //
  Root,
  Item,
};
