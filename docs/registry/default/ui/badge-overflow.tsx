"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

const badgeWidthCache = new Map<string, number>();

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
    badgeIconSize?: number;
    badgeMaxWidth?: number;
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
    badgeMaxWidth,
    badgeIconSize,
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
  const [badgeGap, setBadgeGap] = React.useState(4);
  const [badgeHeight, setBadgeHeight] = React.useState(20);
  const [overflowBadgeWidth, setOverflowBadgeWidth] = React.useState(40);
  const [isMeasured, setIsMeasured] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!rootRef.current) return;

    function measureContainer() {
      if (!rootRef.current) return;

      const computedStyle = getComputedStyle(rootRef.current);

      const gapValue = computedStyle.gap;
      const gap = gapValue ? parseFloat(gapValue) : 4;
      setBadgeGap(gap);

      const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
      const paddingRight = parseFloat(computedStyle.paddingRight) || 0;
      const totalPadding = paddingLeft + paddingRight;

      const tempBadge = document.createElement("div");
      tempBadge.className =
        "inline-flex items-center rounded-md border px-1.5 text-xs font-semibold h-5 gap-1 shrink-0 absolute invisible pointer-events-none";
      tempBadge.textContent = "Measure";
      document.body.appendChild(tempBadge);
      const measuredBadgeHeight = tempBadge.offsetHeight;
      document.body.removeChild(tempBadge);
      setBadgeHeight(measuredBadgeHeight || 20);

      const tempOverflow = document.createElement("div");
      tempOverflow.className =
        "inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-semibold text-xs absolute invisible pointer-events-none";
      tempOverflow.textContent = "+99";
      document.body.appendChild(tempOverflow);
      const measuredOverflowWidth = tempOverflow.offsetWidth;
      document.body.removeChild(tempOverflow);
      setOverflowBadgeWidth(measuredOverflowWidth || 40);

      const width = rootRef.current.clientWidth - totalPadding;
      setContainerWidth(width);
      setIsMeasured(true);
    }

    measureContainer();

    const resizeObserver = new ResizeObserver(measureContainer);
    resizeObserver.observe(rootRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const placeholderHeight = React.useMemo(
    () => badgeHeight * lineCount + badgeGap * (lineCount - 1),
    [badgeHeight, badgeGap, lineCount],
  );

  const { visibleItems, hiddenCount } = React.useMemo(() => {
    if (!containerWidth || items.length === 0) {
      return { visibleItems: items, hiddenCount: 0 };
    }

    let currentLineWidth = 0;
    let currentLine = 1;
    const visible: T[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;

      const label = getBadgeLabel(item);
      const cacheKey = cacheKeyPrefix ? `${cacheKeyPrefix}:${label}` : label;

      const badgeWidth = measureBadgeWidth({
        label,
        cacheKey,
        iconSize: badgeIconSize,
        maxWidth: badgeMaxWidth,
      });

      const widthWithGap = badgeWidth + badgeGap;
      const isLastLine = currentLine === lineCount;
      const hasMoreItems = i < items.length - 1;

      if (currentLineWidth + widthWithGap <= containerWidth) {
        currentLineWidth += widthWithGap;
        visible.push(item);
      } else if (currentLine < lineCount) {
        currentLine++;
        currentLineWidth = widthWithGap;
        visible.push(item);
      } else {
        // We're on the last line and this badge doesn't fit
        // Need to ensure overflow badge fits on this line
        break;
      }

      // If we're on the last line and there are more items,
      // check if overflow badge will fit. If not, remove badges until it fits.
      if (isLastLine && hasMoreItems) {
        const overflowWidthWithGap = overflowBadgeWidth + badgeGap;
        while (
          visible.length > 0 &&
          currentLineWidth + overflowWidthWithGap > containerWidth
        ) {
          const removed = visible.pop();
          if (removed) {
            const removedLabel = getBadgeLabel(removed);
            const removedCacheKey = cacheKeyPrefix
              ? `${cacheKeyPrefix}:${removedLabel}`
              : removedLabel;
            const removedWidth = measureBadgeWidth({
              label: removedLabel,
              cacheKey: removedCacheKey,
              iconSize: badgeIconSize,
              maxWidth: badgeMaxWidth,
            });
            currentLineWidth -= removedWidth + badgeGap;
          }
        }
        if (visible.length === 0) break;
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
    badgeIconSize,
    badgeMaxWidth,
    badgeGap,
    overflowBadgeWidth,
  ]);

  const Comp = asChild ? Slot : "div";

  if (!isMeasured) {
    return (
      <Comp
        data-slot="badge-overflow"
        {...rootProps}
        ref={composedRef}
        className={cn("flex flex-wrap", className)}
        style={{
          gap: badgeGap,
          minHeight: placeholderHeight,
          ...style,
        }}
      />
    );
  }

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
