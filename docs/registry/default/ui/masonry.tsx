"use client";

import { useComposedRefs } from "@/lib/composition";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import * as ReactDOM from "react-dom";

const ROOT_NAME = "MasonryRoot";
const ITEM_NAME = "MasonryItem";

const DATA_LINE_BREAK_ATTR = "data-masonry-line-break";
const DATA_ITEM_ATTR = "data-masonry-item";

const COLUMN_COUNT = 4;
const GAP = 16;

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

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: ResponsiveValue;
  defaultColumnCount?: number;
  gap?: ResponsiveValue;
  defaultGap?: number;
  linear?: boolean;
  asChild?: boolean;
}

// Cache for layout calculations
const layoutCache = new Map<
  string,
  { heights: number[]; positions: { top: number; left: number }[] }
>();

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnCount = COLUMN_COUNT,
      defaultColumnCount = columnCount,
      gap = GAP,
      defaultGap = gap,
      linear = false,
      asChild,
      className,
      style,
      ...rootProps
    } = props;

    const [maxColumnHeight, setMaxColumnHeight] = React.useState<number>();
    const collectionRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const prevLayoutKey = React.useRef("");
    const resizeTimeoutRef = React.useRef<number | null>(null);

    const [mounted, setMounted] = React.useState(false);
    React.useLayoutEffect(() => {
      setMounted(true);
    }, []);

    const currentColumnCount = useResponsiveValue({
      value: columnCount,
      defaultValue: COLUMN_COUNT,
      mounted,
    });
    const currentGap = useResponsiveValue({
      value: gap,
      defaultValue: GAP,
      mounted,
    });
    const lineBreakCount = currentColumnCount > 0 ? currentColumnCount - 1 : 0;

    // Memoize items array creation
    const getItems = React.useCallback(() => {
      if (!collectionRef.current) return [];
      return Array.from(collectionRef.current.children).filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement &&
          child.dataset[DATA_LINE_BREAK_ATTR] !== "",
      );
    }, []);

    const calculateLayout = React.useCallback(() => {
      if (!collectionRef.current || !mounted) return;

      const items = getItems();
      const layoutKey = `${items.length}-${currentColumnCount}-${currentGap}-${linear}`;

      // Check if we can use cached layout
      if (layoutKey === prevLayoutKey.current && layoutCache.has(layoutKey)) {
        const cachedLayout = layoutCache.get(layoutKey);
        if (cachedLayout) {
          for (const [index, item] of items.entries()) {
            const position = cachedLayout.positions[index];
            if (position) {
              Object.assign(item.style, {
                position: "absolute",
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `calc(${100 / currentColumnCount}% - ${(currentGap * (currentColumnCount - 1)) / currentColumnCount}px)`,
                margin: `${currentGap / 2}px`,
              });
            }
          }
          setMaxColumnHeight(Math.max(...cachedLayout.heights));
          return;
        }
      }

      const columnHeights = new Array(currentColumnCount).fill(0);
      const positions: { top: number; left: number }[] = [];
      let skip = false;
      let nextOrder = 1;

      // Reset styles
      for (const item of items) {
        if (item.dataset[DATA_LINE_BREAK_ATTR] === "") continue;
        const styles: Partial<CSSStyleDeclaration> = {
          position: "",
          top: "",
          left: "",
          width: `calc(${100 / currentColumnCount}% - ${(currentGap * (currentColumnCount - 1)) / currentColumnCount}px)`,
          margin: `${currentGap / 2}px`,
        };
        Object.assign(item.style, styles);
      }

      // Position items with batched updates
      ReactDOM.flushSync(() => {
        for (const item of items) {
          if (item.dataset.lineBreak === DATA_LINE_BREAK_ATTR || skip) {
            positions.push({ top: 0, left: 0 });
            continue;
          }

          const itemStyle = window.getComputedStyle(item);
          const marginTop =
            Number.parseFloat(itemStyle.marginTop) || currentGap / 2;
          const marginBottom =
            Number.parseFloat(itemStyle.marginBottom) || currentGap / 2;
          const itemHeight = item.offsetHeight + marginTop + marginBottom;

          if (
            itemHeight === 0 ||
            Array.from(item.getElementsByTagName("img")).some(
              (img) => img.clientHeight === 0,
            )
          ) {
            skip = true;
            positions.push({ top: 0, left: 0 });
            continue;
          }

          let position: { top: number; left: number };

          if (linear) {
            const yPos = columnHeights[nextOrder - 1];
            position = {
              top: yPos,
              left: (nextOrder - 1) * (item.offsetWidth + currentGap),
            };
            columnHeights[nextOrder - 1] = yPos + itemHeight;
            nextOrder = (nextOrder % currentColumnCount) + 1;
          } else {
            const minColumnIndex = columnHeights.indexOf(
              Math.min(...columnHeights),
            );
            const xPos = minColumnIndex * (item.offsetWidth + currentGap);
            const yPos = columnHeights[minColumnIndex];
            position = { top: yPos, left: xPos };
            columnHeights[minColumnIndex] = yPos + itemHeight;
          }

          positions.push(position);
          Object.assign(item.style, {
            position: "absolute",
            top: `${position.top}px`,
            left: `${position.left}px`,
          });
        }

        if (!skip) {
          const maxHeight = Math.max(...columnHeights);
          setMaxColumnHeight(maxHeight > 0 ? maxHeight : undefined);

          // Cache the layout
          layoutCache.set(layoutKey, {
            heights: columnHeights,
            positions,
          });
          prevLayoutKey.current = layoutKey;
        }
      });
    }, [currentColumnCount, currentGap, linear, mounted, getItems]);

    // Custom debounced resize handler
    const handleResize = React.useCallback(() => {
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = window.setTimeout(calculateLayout, 150);
    }, [calculateLayout]);

    useIsomorphicLayoutEffect(() => {
      if (typeof ResizeObserver === "undefined") return;

      const resizeObserver = new ResizeObserver(handleResize);
      const content = collectionRef.current;

      if (content) {
        resizeObserver.observe(content);
        const children = Array.from(content.children);

        for (const child of children) {
          resizeObserver.observe(child);
        }

        return () => {
          for (const child of children) {
            resizeObserver.unobserve(child);
          }
          resizeObserver.unobserve(content);
          resizeObserver.disconnect();
          if (resizeTimeoutRef.current) {
            window.clearTimeout(resizeTimeoutRef.current);
          }
        };
      }
    }, [handleResize]);

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
          ? `repeat(${getInitialValue(defaultColumnCount, 4)}, 1fr)`
          : undefined,
        gap: !mounted ? `${getInitialValue(defaultGap, 16)}px` : undefined,
      }),
      [mounted, defaultColumnCount, defaultGap],
    );

    const contextValue: MasonryContextValue = React.useMemo(
      () => ({ mounted }),
      [mounted],
    );

    const RootSlot = asChild ? Slot : "div";

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
