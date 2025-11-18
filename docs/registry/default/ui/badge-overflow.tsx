"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
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
}

function measureBadgeWidth({
  label,
  cacheKey,
  iconSize,
  maxWidth,
}: MeasureBadgeWidthProps): number {
  const cached = badgeWidthCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const measureEl = document.createElement("div");
  measureEl.className =
    "inline-flex items-center rounded-md border px-1.5 text-xs font-semibold h-5 gap-1 shrink-0 absolute invisible pointer-events-none";
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

interface GetBadgeLabel<T> {
  /**
   * Callback that returns a label string for each badge item.
   * Optional for primitive arrays (strings, numbers), required for object arrays.
   * @example getBadgeLabel={(item) => item.name}
   */
  getBadgeLabel: (item: T) => string;
}

type BadgeOverflowElement = React.ComponentRef<typeof BadgeOverflow>;

type BadgeOverflowProps<T = string> = React.ComponentProps<"div"> &
  (T extends object ? GetBadgeLabel<T> : Partial<GetBadgeLabel<T>>) & {
    items: T[];
    lineCount?: number;
    cacheKeyPrefix?: string;
    iconSize?: number;
    maxWidth?: number;
    containerPadding?: number;
    badgeGap?: number;
    overflowBadgeWidth?: number;
    renderBadge: (item: T, label: string) => React.ReactNode;
    renderOverflow?: (count: number) => React.ReactNode;
    asChild?: boolean;
  };

function BadgeOverflow<T = string>(props: BadgeOverflowProps<T>) {
  const {
    items,
    getBadgeLabel: getBadgeLabelProp,
    lineCount = 1,
    cacheKeyPrefix = "",
    containerPadding = DEFAULT_CONTAINER_PADDING,
    badgeGap = DEFAULT_BADGE_GAP,
    overflowBadgeWidth = DEFAULT_OVERFLOW_BADGE_WIDTH,
    iconSize,
    maxWidth,
    renderBadge,
    renderOverflow,
    asChild,
    className,
    style,
    ref,
    ...rootProps
  } = props;

  const getBadgeLabel = React.useCallback(
    (item: T): string => {
      if (typeof item === "object" && !getBadgeLabelProp) {
        throw new Error(
          "`getBadgeLabel` is required when using array of objects",
        );
      }
      return getBadgeLabelProp ? getBadgeLabelProp(item) : (item as string);
    },
    [getBadgeLabelProp],
  );

  const rootRef = React.useRef<BadgeOverflowElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const [containerWidth, setContainerWidth] = React.useState(0);

  React.useLayoutEffect(() => {
    if (!rootRef.current) return;

    function measureWidth() {
      if (rootRef.current) {
        const width = rootRef.current.clientWidth - containerPadding;
        setContainerWidth(width);
      }
    }

    measureWidth();

    const resizeObserver = new ResizeObserver(measureWidth);
    resizeObserver.observe(rootRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerPadding]);

  const { visibleItems, hiddenCount } = React.useMemo(() => {
    if (!containerWidth || items.length === 0) {
      return { visibleItems: items, hiddenCount: 0 };
    }

    let currentLineWidth = 0;
    let currentLine = 1;
    const visible: T[] = [];

    for (const item of items) {
      const label = getBadgeLabel(item);
      const cacheKey = cacheKeyPrefix ? `${cacheKeyPrefix}:${label}` : label;

      const badgeWidth = measureBadgeWidth({
        label,
        cacheKey,
        iconSize,
        maxWidth,
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
    getBadgeLabel,
    containerWidth,
    lineCount,
    cacheKeyPrefix,
    iconSize,
    maxWidth,
    badgeGap,
    overflowBadgeWidth,
  ]);

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="badge-overflow"
      {...rootProps}
      ref={composedRef}
      className={cn("flex flex-wrap", className)}
      style={{
        gap: badgeGap,
        ...style,
      }}
    >
      {visibleItems.map((item, index) => (
        <React.Fragment key={index}>
          {renderBadge(item, getBadgeLabel(item))}
        </React.Fragment>
      ))}
      {hiddenCount > 0 &&
        (renderOverflow ? (
          renderOverflow(hiddenCount)
        ) : (
          <div className="inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-semibold text-xs">
            +{hiddenCount}
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
