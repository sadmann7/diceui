"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

const DATA_LINE_BREAK_ATTR = "data-masonry-line-break";
const DATA_ITEM_ATTR = "data-masonry-item";

const ROOT_NAME = "MasonryRoot";
const ITEM_NAME = "MasonryItem";

const MASONRY_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface MasonryContextValue {
  mounted: boolean;
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

interface ItemMeasurements {
  height: number;
  marginTop: number;
  marginBottom: number;
  width: number;
}

const itemCache = new WeakMap<HTMLElement, ItemMeasurements>();

// Add a function to clear items from cache for specific elements
function clearItemCacheFor(items: HTMLElement[]) {
  for (const item of items) {
    itemCache.delete(item);
  }
}

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
  collectionRef,
}: {
  value: ResponsiveValue;
  defaultValue: number;
  mounted: boolean;
  collectionRef: React.RefObject<HTMLDivElement | null>;
}): number {
  const initialValue = React.useMemo(
    () => getInitialValue(value, defaultValue),
    [value, defaultValue],
  );
  const [currentValue, setCurrentValue] = React.useState(initialValue);

  const onResize = React.useCallback(() => {
    if (!mounted) return;

    // Clear cache for all masonry items on resize
    if (collectionRef?.current) {
      const items = Array.from(
        collectionRef.current.querySelectorAll(`[${DATA_ITEM_ATTR}]`),
      ).filter((child): child is HTMLElement => child instanceof HTMLElement);
      clearItemCacheFor(items);
    }

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

    if (newValue !== currentValue) {
      setCurrentValue(newValue);
    }
  }, [value, defaultValue, mounted, currentValue, collectionRef]);

  React.useEffect(() => {
    if (!mounted) return;

    // Initial calculation
    onResize();

    const debouncedResize = (() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      return () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(onResize, 100);
      };
    })();

    window.addEventListener("resize", debouncedResize);
    return () => window.removeEventListener("resize", debouncedResize);
  }, [onResize, mounted]);

  return currentValue;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

function getMasonryItemMeasurements(
  element: HTMLElement,
  gap: number,
): ItemMeasurements {
  const cached = itemCache.get(element);
  if (cached) return cached;

  const style = window.getComputedStyle(element);
  const measurements = {
    height: element.offsetHeight,
    marginTop: Number.parseFloat(style.marginTop) || gap / 2,
    marginBottom: Number.parseFloat(style.marginBottom) || gap / 2,
    width: element.offsetWidth,
  };

  itemCache.set(element, measurements);
  return measurements;
}

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: ResponsiveValue;
  gap?: ResponsiveValue;
  linear?: boolean;
  asChild?: boolean;
}

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnCount = 4,
      gap = 16,
      linear = false,
      asChild,
      className,
      style,
      ...rootProps
    } = props;

    const [maxColumnHeight, setMaxColumnHeight] = React.useState<number>();
    const collectionRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const layoutTimeoutRef = React.useRef<number | null>(null);

    const [mounted, setMounted] = React.useState(false);
    React.useLayoutEffect(() => {
      setMounted(true);
    }, []);

    const currentColumnCount = useResponsiveValue({
      value: columnCount,
      defaultValue: 4,
      mounted,
      collectionRef,
    });
    const currentGap = useResponsiveValue({
      value: gap,
      defaultValue: 16,
      mounted,
      collectionRef,
    });
    const lineBreakCount = currentColumnCount > 0 ? currentColumnCount - 1 : 0;

    const calculateLayout = React.useCallback(() => {
      if (!collectionRef.current || !mounted) return;

      const items = Array.from(
        collectionRef.current.querySelectorAll(`[${DATA_ITEM_ATTR}]`),
      ).filter((child): child is HTMLElement => child instanceof HTMLElement);

      const columnHeights = new Array(currentColumnCount).fill(0);
      let skip = false;

      // Clear cache for all items when layout recalculates
      clearItemCacheFor(items);

      // Reset styles
      for (const item of items) {
        Object.assign(item.style, {
          position: "absolute",
          width: `calc(${100 / currentColumnCount}% - ${
            (currentGap * (currentColumnCount - 1)) / currentColumnCount
          }px)`,
          margin: `${currentGap / 2}px`,
        });
      }

      // Position items
      for (const item of items) {
        if (skip) continue;

        const measurements = getMasonryItemMeasurements(item, currentGap);
        const itemHeight =
          measurements.height +
          measurements.marginTop +
          measurements.marginBottom;

        if (
          itemHeight === 0 ||
          Array.from(item.getElementsByTagName("img")).some(
            (img) => img.clientHeight === 0,
          )
        ) {
          skip = true;
          continue;
        }

        if (linear) {
          const columnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const yPos = columnHeights[columnIndex];
          Object.assign(item.style, {
            top: `${yPos}px`,
            left: `${columnIndex * (measurements.width + currentGap)}px`,
          });
          columnHeights[columnIndex] = yPos + itemHeight;
        } else {
          const minColumnIndex = columnHeights.indexOf(
            Math.min(...columnHeights),
          );
          const xPos = minColumnIndex * (measurements.width + currentGap);
          const yPos = columnHeights[minColumnIndex];

          Object.assign(item.style, {
            top: `${yPos}px`,
            left: `${xPos}px`,
          });
          columnHeights[minColumnIndex] = yPos + itemHeight;
        }
      }

      if (!skip) {
        ReactDOM.flushSync(() => {
          const maxHeight = Math.max(...columnHeights);
          setMaxColumnHeight(maxHeight > 0 ? maxHeight : undefined);
        });
      }
    }, [currentColumnCount, currentGap, linear, mounted]);

    useIsomorphicLayoutEffect(() => {
      if (typeof ResizeObserver === "undefined") return;

      const resizeObserver = new ResizeObserver(() => {
        if (layoutTimeoutRef.current) {
          cancelAnimationFrame(layoutTimeoutRef.current);
        }
        layoutTimeoutRef.current = requestAnimationFrame(calculateLayout);
      });

      const content = collectionRef.current;
      if (content) {
        resizeObserver.observe(content);
        const items = content.querySelectorAll(`[${DATA_ITEM_ATTR}]`);
        for (const child of items) {
          resizeObserver.observe(child);
        }
      }

      return () => {
        if (layoutTimeoutRef.current) {
          cancelAnimationFrame(layoutTimeoutRef.current);
        }
        resizeObserver.disconnect();
      };
    }, [calculateLayout]);

    const lineBreaks = React.useMemo(() => {
      if (!mounted) return null;

      return Array.from({ length: lineBreakCount }, (_, i) => {
        const key = `line-break-${currentColumnCount}-${i}`;

        return (
          <span
            key={key}
            {...{ [DATA_LINE_BREAK_ATTR]: "" }}
            style={{
              flexBasis: "100%",
              width: 0,
              margin: 0,
              padding: 0,
              order: i + 1,
            }}
          />
        );
      });
    }, [lineBreakCount, mounted, currentColumnCount]);

    const initialGridStyle = React.useMemo(
      () => ({
        display: mounted ? "block" : "grid",
        gridTemplateColumns: !mounted
          ? `repeat(${getInitialValue(columnCount, 4)}, 1fr)`
          : undefined,
        gap: !mounted ? `${getInitialValue(gap, 16)}px` : undefined,
      }),
      [columnCount, gap, mounted],
    );

    const RootSlot = asChild ? Slot : "div";

    const contextValue = React.useMemo(
      () => ({
        mounted,
      }),
      [mounted],
    );

    return (
      <MasonryContext.Provider value={contextValue}>
        <RootSlot
          {...rootProps}
          ref={composedRef}
          className={cn("relative mx-auto w-full", className)}
          style={{
            ...style,
            ...initialGridStyle,
            height:
              mounted && maxColumnHeight ? `${maxColumnHeight}px` : "auto",
            minHeight: "0px",
            width: mounted ? `calc(100% - ${currentGap}px)` : "100%",
            marginLeft: mounted ? `${currentGap / 2}px` : undefined,
            marginRight: mounted ? `${currentGap / 2}px` : undefined,
          }}
        >
          {children}
          {lineBreaks}
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

    return (
      <ItemSlot
        {...{ [DATA_ITEM_ATTR]: "" }}
        {...itemProps}
        ref={forwardedRef}
      />
    );
  },
);

MasonryItem.displayName = ITEM_NAME;

const Root = Masonry;
const Item = MasonryItem;

export {
  Item,
  Masonry,
  MasonryItem,
  //
  Root,
};
