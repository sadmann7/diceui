"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { cn } from "@/lib/utils";

const badgeWidthCache = new Map<string, number>();

const DEFAULT_CONTAINER_PADDING = 16; // px-2 = 8px * 2
const DEFAULT_BADGE_GAP = 4; // gap-1 = 4px
const DEFAULT_OVERFLOW_BADGE_WIDTH = 40; // Approximate width of "+N" badge

interface MeasureBadgeWidthProps {
  label: string;
  cacheKey: string;
  iconSize?: number;
  maxWidth?: number;
  className?: string;
}

function measureBadgeWidth({
  label,
  cacheKey,
  iconSize,
  maxWidth,
  className,
}: MeasureBadgeWidthProps): number {
  const cached = badgeWidthCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const measureEl = document.createElement("div");
  measureEl.className = `inline-flex items-center rounded-md border px-1.5 text-xs font-semibold h-5 gap-1 shrink-0 absolute invisible pointer-events-none ${
    className ?? ""
  }`;
  measureEl.style.whiteSpace = "nowrap";

  if (iconSize) {
    const icon = document.createElement("span");
    icon.className = "shrink-0";
    icon.style.width = `${iconSize}px`;
    icon.style.height = `${iconSize}px`;
    measureEl.appendChild(icon);
  }

  if (maxWidth) {
    const text = document.createElement("span");
    text.className = "truncate";
    text.style.maxWidth = `${maxWidth}px`;
    text.textContent = label;
    measureEl.appendChild(text);
  } else {
    measureEl.textContent = label;
  }

  document.body.appendChild(measureEl);
  const width = measureEl.offsetWidth;
  document.body.removeChild(measureEl);

  badgeWidthCache.set(cacheKey, width);
  return width;
}

function clearBadgeWidthCache(): void {
  badgeWidthCache.clear();
}

interface BadgeOverflowProps<T = string> extends React.ComponentProps<"div"> {
  items: T[];
  lineCount?: number;
  cacheKeyPrefix?: string;
  iconSize?: number;
  maxWidth?: number;
  containerPadding?: number;
  badgeGap?: number;
  overflowBadgeWidth?: number;
  getLabel: (item: T) => string;
  renderBadge: (item: T, label: string) => React.ReactNode;
  renderOverflow?: (count: number) => React.ReactNode;
  asChild?: boolean;
}

function BadgeOverflow<T = string>(props: BadgeOverflowProps<T>) {
  const {
    items,
    getLabel,
    lineCount = 1,
    cacheKeyPrefix = "",
    containerPadding = DEFAULT_CONTAINER_PADDING,
    badgeGap = DEFAULT_BADGE_GAP,
    overflowBadgeWidth = DEFAULT_OVERFLOW_BADGE_WIDTH,
    iconSize,
    maxWidth,
    className,
    renderBadge,
    renderOverflow,
    asChild = false,
    ...rootProps
  } = props;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useEffect(() => {
    if (!containerRef.current) return;

    function measureWidth() {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - containerPadding;
        setContainerWidth(width);
      }
    }

    measureWidth();

    const resizeObserver = new ResizeObserver(measureWidth);
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerPadding]);

  const result = React.useMemo(() => {
    if (!containerWidth || items.length === 0) {
      return { visibleItems: items, hiddenCount: 0 };
    }

    let currentLineWidth = 0;
    let currentLine = 1;
    const visible: T[] = [];

    for (const item of items) {
      const label = getLabel(item);
      const cacheKey = cacheKeyPrefix ? `${cacheKeyPrefix}:${label}` : label;

      const badgeWidth = measureBadgeWidth({
        label,
        cacheKey,
        iconSize,
        maxWidth,
        className,
      });

      const widthWithGap = badgeWidth + badgeGap;

      if (currentLineWidth + widthWithGap <= containerWidth) {
        currentLineWidth += widthWithGap;
        visible.push(item);
      } else if (currentLine < lineCount) {
        currentLine++;
        currentLineWidth = widthWithGap;
        visible.push(item);
      } else {
        if (
          currentLineWidth + overflowBadgeWidth > containerWidth &&
          visible.length > 0
        ) {
          visible.pop();
        }
        break;
      }
    }

    return {
      visibleItems: visible,
      hiddenCount: Math.max(0, items.length - visible.length),
    };
  }, [
    items,
    getLabel,
    containerWidth,
    lineCount,
    cacheKeyPrefix,
    iconSize,
    maxWidth,
    className,
    badgeGap,
    overflowBadgeWidth,
  ]);

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      ref={containerRef}
      data-slot="badge-overflow"
      className={cn("flex flex-wrap gap-1", className)}
      {...rootProps}
    >
      {result.visibleItems.map((item, index) => (
        <React.Fragment key={index}>
          {renderBadge(item, getLabel(item))}
        </React.Fragment>
      ))}
      {result.hiddenCount > 0 &&
        (renderOverflow ? (
          renderOverflow(result.hiddenCount)
        ) : (
          <div className="inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-semibold text-xs">
            +{result.hiddenCount}
          </div>
        ))}
    </Comp>
  );
}

export {
  BadgeOverflow,
  //
  clearBadgeWidthCache,
};
