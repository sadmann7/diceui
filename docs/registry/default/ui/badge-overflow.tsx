"use client";

import { Slot } from "@radix-ui/react-slot";
import * as React from "react";
import { useComposedRefs } from "@/lib/compose-refs";
import { cn } from "@/lib/utils";

interface BadgeOverflowContextValue {
  visibleIndices: Set<number>;
  onItemRegister: (index: number, width: number) => () => void;
  overflowCount: number;
}

const BadgeOverflowContext =
  React.createContext<BadgeOverflowContextValue | null>(null);

function useBadgeOverflowContext(consumerName: string) {
  const context = React.useContext(BadgeOverflowContext);
  if (!context) {
    throw new Error(
      `\`${consumerName}\` must be used within \`BadgeOverflow\``,
    );
  }
  return context;
}

interface BadgeOverflowProps extends React.ComponentProps<"div"> {
  lineCount?: number;
  asChild?: boolean;
}

function BadgeOverflow({
  lineCount = 1,
  asChild,
  className,
  ref,
  ...props
}: BadgeOverflowProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, rootRef);
  const [containerWidth, setContainerWidth] = React.useState(0);
  const [gap, setGap] = React.useState(0);
  const [isMeasured, setIsMeasured] = React.useState(false);

  const itemWidthsRef = React.useRef<Map<number, number>>(new Map());
  const [visibleIndices, setVisibleIndices] = React.useState<Set<number>>(
    new Set(),
  );
  const [overflowCount, setOverflowCount] = React.useState(0);
  const overflowWidthRef = React.useRef(0);

  React.useLayoutEffect(() => {
    if (!rootRef.current) return;

    function measureContainer() {
      if (!rootRef.current) return;

      const computed = getComputedStyle(rootRef.current);
      const gapValue = Number.parseFloat(computed.gap) || 0;
      const paddingLeft = Number.parseFloat(computed.paddingLeft) || 0;
      const paddingRight = Number.parseFloat(computed.paddingRight) || 0;
      const totalPadding = paddingLeft + paddingRight;

      setGap(gapValue);
      setContainerWidth(rootRef.current.clientWidth - totalPadding);
      setIsMeasured(true);
    }

    measureContainer();

    const resizeObserver = new ResizeObserver(measureContainer);
    resizeObserver.observe(rootRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const onItemRegister = React.useCallback((index: number, width: number) => {
    itemWidthsRef.current.set(index, width);
    return () => {
      itemWidthsRef.current.delete(index);
    };
  }, []);

  const registerOverflow = React.useCallback((width: number) => {
    overflowWidthRef.current = width;
  }, []);

  React.useLayoutEffect(() => {
    if (!isMeasured || containerWidth === 0) return;

    const itemWidths = itemWidthsRef.current;
    const sortedIndices = Array.from(itemWidths.keys()).sort((a, b) => a - b);

    let currentLineWidth = 0;
    let currentLine = 1;
    const visible = new Set<number>();

    for (const index of sortedIndices) {
      const itemWidth = itemWidths.get(index) ?? 0;
      const widthWithGap = currentLineWidth === 0 ? itemWidth : itemWidth + gap;

      if (currentLineWidth + widthWithGap <= containerWidth) {
        currentLineWidth += widthWithGap;
        visible.add(index);
      } else if (currentLine < lineCount) {
        currentLine++;
        currentLineWidth = itemWidth;
        visible.add(index);
      } else {
        // Check if we need to pop the last item to make room for overflow badge
        const lastVisibleIndex = Array.from(visible).pop();
        if (
          lastVisibleIndex !== undefined &&
          currentLineWidth + overflowWidthRef.current > containerWidth
        ) {
          visible.delete(lastVisibleIndex);
        }
        break;
      }
    }

    setVisibleIndices(visible);
    setOverflowCount(sortedIndices.length - visible.size);
  }, [isMeasured, containerWidth, gap, lineCount]);

  const contextValue = React.useMemo<BadgeOverflowContextValue>(
    () => ({
      visibleIndices,
      onItemRegister,
      overflowCount,
    }),
    [visibleIndices, onItemRegister, overflowCount],
  );

  const Comp = asChild ? Slot : "div";

  return (
    <BadgeOverflowContext.Provider value={contextValue}>
      <Comp
        data-slot="badge-overflow"
        {...props}
        ref={composedRef}
        className={cn("flex flex-wrap", className)}
      />
      {!isMeasured && (
        <OverflowWidthMeasurer onWidthMeasured={registerOverflow} />
      )}
    </BadgeOverflowContext.Provider>
  );
}

type BadgeOverflowItemProps = React.ComponentPropsWithRef<"div"> & {
  index: number;
  asChild?: boolean;
};

function BadgeOverflowItem({
  index,
  asChild,
  children,
  className,
  style,
  ref,
  ...props
}: BadgeOverflowItemProps) {
  const { visibleIndices, onItemRegister } =
    useBadgeOverflowContext("BadgeOverflowItem");

  const itemRef = React.useRef<HTMLDivElement>(null);
  const composedRef = useComposedRefs(ref, itemRef);
  const [hasMeasured, setHasMeasured] = React.useState(false);

  React.useLayoutEffect(() => {
    if (!itemRef.current) return;

    const width = itemRef.current.offsetWidth;
    const unregister = onItemRegister(index, width);
    setHasMeasured(true);

    return unregister;
  }, [index, onItemRegister]);

  const isVisible = visibleIndices.has(index);
  const Comp = asChild ? Slot : "div";

  // Render but hide during measurement phase
  if (!hasMeasured || visibleIndices.size === 0) {
    return (
      <Comp
        data-slot="badge-overflow-item"
        data-index={index}
        {...props}
        ref={composedRef}
        className={className}
        style={{
          ...style,
          visibility: "hidden",
          position: "absolute",
        }}
      >
        {children}
      </Comp>
    );
  }

  if (!isVisible) return null;

  return (
    <Comp
      data-slot="badge-overflow-item"
      data-index={index}
      {...props}
      ref={composedRef}
      className={className}
      style={style}
    >
      {children}
    </Comp>
  );
}

type BadgeOverflowOverflowProps = React.ComponentPropsWithRef<"div"> & {
  asChild?: boolean;
};

function BadgeOverflowOverflow({
  asChild,
  className,
  children,
  ref,
  ...props
}: BadgeOverflowOverflowProps) {
  const { overflowCount } = useBadgeOverflowContext("BadgeOverflowOverflow");

  if (overflowCount === 0) return null;

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="badge-overflow-overflow"
      {...props}
      ref={ref}
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-semibold text-xs",
        className,
      )}
    >
      {children ?? `+${overflowCount}`}
    </Comp>
  );
}

interface OverflowWidthMeasurerProps {
  onWidthMeasured: (width: number) => void;
}

function OverflowWidthMeasurer({
  onWidthMeasured,
}: OverflowWidthMeasurerProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (ref.current) {
      onWidthMeasured(ref.current.offsetWidth);
    }
  }, [onWidthMeasured]);

  return (
    <div
      ref={ref}
      className="pointer-events-none invisible absolute inline-flex h-5 shrink-0 items-center rounded-md border px-1.5 font-semibold text-xs"
    >
      +99
    </div>
  );
}

export { BadgeOverflow, BadgeOverflowItem, BadgeOverflowOverflow };
