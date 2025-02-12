"use client";

import { useComposedRefs } from "@/lib/composition";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const ROOT_NAME = "MasonryRoot";
const ITEM_NAME = "MasonryItem";

const COLUMN_COUNT = 4;
const GAP = 0;

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

// Interval Tree Implementation
type Color = 0 | 1 | 2;
const RED = 0;
const BLACK = 1;
const NIL = 2;

interface ListNode {
  index: number;
  high: number;
  next: ListNode | null;
}

interface TreeNode {
  max: number;
  low: number;
  high: number;
  C: Color;
  P: TreeNode;
  R: TreeNode;
  L: TreeNode;
  list: ListNode;
}

const DELETE = 0;
const KEEP = 1;

const NULL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  C: NIL,
  list: { index: -1, high: 0, next: null },
  P: undefined as unknown as TreeNode,
  R: undefined as unknown as TreeNode,
  L: undefined as unknown as TreeNode,
};

NULL_NODE.P = NULL_NODE;
NULL_NODE.L = NULL_NODE;
NULL_NODE.R = NULL_NODE;

const defaultAreEqual = <T extends unknown[]>(current: T, prev: T): boolean =>
  current[0] === prev[0] &&
  current[1] === prev[1] &&
  current[2] === prev[2] &&
  current[3] === prev[3];

function memoize<TArgs extends unknown[], TResult>(
  callback: (...args: TArgs) => TResult,
  areEqual?: (currentArgs: TArgs, prevArgs: TArgs) => boolean,
): (...args: TArgs) => TResult {
  const equal = areEqual || defaultAreEqual;
  let prevArgs: TArgs | undefined;
  let prevResult: TResult | undefined;

  return (...args: TArgs): TResult => {
    if (prevArgs && equal(args, prevArgs)) {
      return prevResult as TResult;
    }
    prevArgs = args;
    prevResult = callback(...args);
    return prevResult;
  };
}

const itemsCache = new Map<HTMLElement, { index: number }>();
const measurementsCache = new Map<
  HTMLElement,
  { width: number; height: number }
>();
const positionsCache = new Map<HTMLElement, { top: number; left: number }>();

// Optimized RAF scheduler with proper types
function createRafScheduler<T extends unknown[]>(
  callback: (...args: T) => void,
  debounceMs = 0,
) {
  let rafId: number | null = null;
  let timeoutId: number | null = null;
  let lastArgs: T | null = null;

  function cancel() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  function schedule(...args: T) {
    lastArgs = args;
    cancel();

    if (debounceMs > 0) {
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        rafId = requestAnimationFrame(() => {
          rafId = null;
          if (lastArgs) callback(...lastArgs);
        });
      }, debounceMs);
    } else {
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (lastArgs) callback(...lastArgs);
      });
    }
  }

  return { schedule, cancel };
}

// Optimized measurement queue with priority
class PriorityQueue<T> {
  private items: T[] = [];
  private priorities = new Map<T, number>();

  get size(): number {
    return this.items.length;
  }

  add(item: T, priority: number): void {
    this.items.push(item);
    this.priorities.set(item, priority);
    this.items.sort(
      (a, b) => (this.priorities.get(b) ?? 0) - (this.priorities.get(a) ?? 0),
    );
  }

  remove(item: T): void {
    const index = this.items.indexOf(item);
    if (index !== -1) {
      this.items.splice(index, 1);
      this.priorities.delete(item);
    }
  }

  peek(): T | undefined {
    return this.items[0];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
    this.priorities.clear();
  }
}

// Optimized intersection observer hook
function useIntersectionObserver<T extends Element | null>(
  ref: React.RefObject<T>,
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {},
) {
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, {
      rootMargin: "200% 0px",
      threshold: 0,
      ...options,
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, callback, options]);
}

// Utilities
function updateMax(node: TreeNode) {
  const max = node.high;
  if (node.L === NULL_NODE && node.R === NULL_NODE) {
    node.max = max;
  } else if (node.L === NULL_NODE) {
    node.max = Math.max(node.R.max, max);
  } else if (node.R === NULL_NODE) {
    node.max = Math.max(node.L.max, max);
  } else {
    node.max = Math.max(Math.max(node.L.max, node.R.max), max);
  }
}

function updateMaxUp(node: TreeNode) {
  let x = node;
  while (x.P !== NULL_NODE) {
    updateMax(x.P);
    x = x.P;
  }
}

function rotateLeft(tree: { root: TreeNode }, x: TreeNode) {
  if (x.R === NULL_NODE) return;
  const y = x.R;
  x.R = y.L;
  if (y.L !== NULL_NODE) y.L.P = x;
  y.P = x.P;

  if (x.P === NULL_NODE) tree.root = y;
  else if (x === x.P.L) x.P.L = y;
  else x.P.R = y;

  y.L = x;
  x.P = y;

  updateMax(x);
  updateMax(y);
}

function rotateRight(tree: { root: TreeNode }, x: TreeNode) {
  if (x.L === NULL_NODE) return;
  const y = x.L;
  x.L = y.R;
  if (y.R !== NULL_NODE) y.R.P = x;
  y.P = x.P;

  if (x.P === NULL_NODE) tree.root = y;
  else if (x === x.P.R) x.P.R = y;
  else x.P.L = y;

  y.R = x;
  x.P = y;

  updateMax(x);
  updateMax(y);
}

function fixInsert(tree: { root: TreeNode }, node: TreeNode) {
  let current = node;
  let uncle: TreeNode;

  while (current.P.C === RED) {
    if (current.P === current.P.P.L) {
      uncle = current.P.P.R;

      if (uncle.C === RED) {
        current.P.C = BLACK;
        uncle.C = BLACK;
        current.P.P.C = RED;
        current = current.P.P;
      } else {
        if (current === current.P.R) {
          current = current.P;
          rotateLeft(tree, current);
        }

        current.P.C = BLACK;
        current.P.P.C = RED;
        rotateRight(tree, current.P.P);
      }
    } else {
      uncle = current.P.P.L;

      if (uncle.C === RED) {
        current.P.C = BLACK;
        uncle.C = BLACK;
        current.P.P.C = RED;
        current = current.P.P;
      } else {
        if (current === current.P.L) {
          current = current.P;
          rotateRight(tree, current);
        }

        current.P.C = BLACK;
        current.P.P.C = RED;
        rotateLeft(tree, current.P.P);
      }
    }
  }
  tree.root.C = BLACK;
}

function minimumTree(node: TreeNode): TreeNode {
  let currentNode = node;
  while (currentNode.L !== NULL_NODE) currentNode = currentNode.L;
  return currentNode;
}

function fixRemove(tree: { root: TreeNode }, node: TreeNode) {
  let current = node;
  let sibling: TreeNode;

  while (current !== NULL_NODE && current.C === BLACK) {
    if (current === current.P.L) {
      sibling = current.P.R;

      if (sibling.C === RED) {
        sibling.C = BLACK;
        current.P.C = RED;
        rotateLeft(tree, current.P);
        sibling = current.P.R;
      }

      if (sibling.L.C === BLACK && sibling.R.C === BLACK) {
        sibling.C = RED;
        current = current.P;
      } else {
        if (sibling.R.C === BLACK) {
          sibling.L.C = BLACK;
          sibling.C = RED;
          rotateRight(tree, sibling);
          sibling = current.P.R;
        }

        sibling.C = current.P.C;
        current.P.C = BLACK;
        sibling.R.C = BLACK;
        rotateLeft(tree, current.P);
        current = tree.root;
      }
    } else {
      sibling = current.P.L;

      if (sibling.C === RED) {
        sibling.C = BLACK;
        current.P.C = RED;
        rotateRight(tree, current.P);
        sibling = current.P.L;
      }

      if (sibling.R.C === BLACK && sibling.L.C === BLACK) {
        sibling.C = RED;
        current = current.P;
      } else {
        if (sibling.L.C === BLACK) {
          sibling.R.C = BLACK;
          sibling.C = RED;
          rotateLeft(tree, sibling);
          sibling = current.P.L;
        }

        sibling.C = current.P.C;
        current.P.C = BLACK;
        sibling.L.C = BLACK;
        rotateRight(tree, current.P);
        current = tree.root;
      }
    }
  }

  current.C = BLACK;
}

function replaceNode(tree: { root: TreeNode }, x: TreeNode, y: TreeNode) {
  if (x.P === NULL_NODE) tree.root = y;
  else if (x === x.P.L) x.P.L = y;
  else x.P.R = y;
  y.P = x.P;
}

function addInterval(treeNode: TreeNode, high: number, index: number): boolean {
  let node: ListNode | null = treeNode.list;
  let prevNode: ListNode | undefined;

  while (node) {
    if (node.index === index) return false;
    if (high > node.high) break;
    prevNode = node;
    node = node.next;
  }

  if (!prevNode) {
    treeNode.list = { index, high, next: node };
  } else {
    prevNode.next = { index, high, next: prevNode.next };
  }

  return true;
}

function removeInterval(treeNode: TreeNode, index: number) {
  const node = treeNode.list;
  if (node.index === index) {
    if (node.next === null) return DELETE;
    treeNode.list = node.next;
    return KEEP;
  }

  let prevNode: ListNode = node;
  let currNode = node.next;

  while (currNode !== null) {
    if (currNode.index === index) {
      prevNode.next = currNode.next;
      return KEEP;
    }
    prevNode = currNode;
    currNode = currNode.next;
  }
}

// Optimize interval tree implementation
function createIntervalTree() {
  const tree = { root: NULL_NODE, size: 0 };
  const indexMap: Record<number, TreeNode> = {};
  const debouncedUpdate = createRafScheduler(() => {
    // Batch updates
    if (pendingUpdates.length > 0) {
      const updates = [...pendingUpdates];
      pendingUpdates.length = 0;
      for (const [index, height] of updates) {
        const node = indexMap[index];
        if (node) {
          node.high = height;
          updateMax(node);
          updateMaxUp(node);
        }
      }
    }
  }).schedule;

  const pendingUpdates: [number, number][] = [];

  return {
    insert(low: number, high: number, index: number) {
      let x = tree.root;
      let y = NULL_NODE;

      while (x !== NULL_NODE) {
        y = x;
        if (low === y.low) break;
        x = low < x.low ? x.L : x.R;
      }

      if (y !== NULL_NODE && low === y.low) {
        if (!addInterval(y, high, index)) return;
        pendingUpdates.push([index, high]);
        debouncedUpdate();
        indexMap[index] = y;
        tree.size++;
        return;
      }

      const z: TreeNode = {
        low,
        high,
        max: high,
        C: RED,
        P: y,
        L: NULL_NODE,
        R: NULL_NODE,
        list: { index, high, next: null },
      };

      if (y === NULL_NODE) tree.root = z;
      else {
        if (z.low < y.low) y.L = z;
        else y.R = z;
        updateMaxUp(z);
      }

      fixInsert(tree, z);
      indexMap[index] = z;
      tree.size++;
    },

    remove(index: number) {
      const z = indexMap[index];
      if (!z) return;
      delete indexMap[index];

      const result = removeInterval(z, index);
      if (result === undefined) return;
      if (result === KEEP) {
        pendingUpdates.push([index, z.list.high]);
        debouncedUpdate();
        tree.size--;
        return;
      }

      let y = z;
      let originalColor = y.C;
      let x: TreeNode;

      if (z.L === NULL_NODE) {
        x = z.R;
        replaceNode(tree, z, z.R);
      } else if (z.R === NULL_NODE) {
        x = z.L;
        replaceNode(tree, z, z.L);
      } else {
        y = minimumTree(z.R);
        originalColor = y.C;
        x = y.R;

        if (y.P === z) x.P = y;
        else {
          replaceNode(tree, y, y.R);
          y.R = z.R;
          y.R.P = y;
        }

        replaceNode(tree, z, y);
        y.L = z.L;
        y.L.P = y;
        y.C = z.C;
      }

      updateMax(x);
      updateMaxUp(x);

      if (originalColor === BLACK) fixRemove(tree, x);
      tree.size--;
    },

    search(
      low: number,
      high: number,
      callback: (index: number, low: number) => void,
    ) {
      const stack = [tree.root];
      while (stack.length > 0) {
        const node = stack[stack.length - 1];
        stack.pop();

        // Skip if node is null or out of range
        if (!node || node === NULL_NODE || low > node.max) continue;

        // Add children to stack
        if (node.L !== NULL_NODE) stack.push(node.L);
        if (node.R !== NULL_NODE) stack.push(node.R);

        // Process current node
        if (node.low <= high && node.high >= low && node.list) {
          let curr: ListNode | null = node.list;
          while (curr !== null) {
            if (curr.high >= low) {
              callback(curr.index, node.low);
            }
            curr = curr.next;
          }
        }
      }
    },

    size: () => tree.size,
  };
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

interface ItemPropsWithRef extends MasonryItemProps {
  ref?: React.Ref<HTMLElement>;
}

type VisibleItem = React.ReactElement<ItemPropsWithRef>;

interface MasonryProps extends React.ComponentPropsWithoutRef<"div"> {
  columnCount?: number | ResponsiveObject;
  defaultColumnCount?: number;
  gap?: number | ResponsiveObject;
  defaultGap?: number;
  overscan?: number;
  itemHeight?: number;
  linear?: boolean;
  asChild?: boolean;
}

// Memoized style getters with proper types
const getContainerStyle = memoize(
  (
    isScrolling: boolean | undefined,
    estimateHeight: number,
  ): React.CSSProperties => ({
    position: "relative",
    width: "100%",
    maxWidth: "100%",
    height: Math.ceil(estimateHeight),
    maxHeight: Math.ceil(estimateHeight),
    willChange: isScrolling ? "contents" : undefined,
    pointerEvents: isScrolling ? "none" : undefined,
  }),
);

const getItemStyle = memoize(
  (
    top: number,
    left: number,
    width: number,
    isVisible: boolean,
    itemStyle?: React.CSSProperties,
  ): React.CSSProperties => ({
    position: "absolute",
    top,
    left,
    width,
    transform: "translateZ(0)",
    willChange: "transform",
    transition: "opacity 0.2s ease-in-out",
    opacity: isVisible ? 1 : 0,
    pointerEvents: isVisible ? "auto" : "none",
    ...itemStyle,
  }),
);

const Masonry = React.forwardRef<HTMLDivElement, MasonryProps>(
  (props, forwardedRef) => {
    const {
      columnCount = COLUMN_COUNT,
      defaultColumnCount = typeof columnCount === "number"
        ? columnCount
        : COLUMN_COUNT,
      gap = GAP,
      defaultGap = typeof gap === "number" ? gap : GAP,
      overscan = 2,
      itemHeight = 300,
      linear = false,
      asChild,
      children,
      style,
      ...rootProps
    } = props;

    const collectionRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, collectionRef);
    const [mounted, setMounted] = React.useState(false);
    const [items, setItems] = React.useState<VisibleItem[]>([]);
    const [maxHeight, setMaxHeight] = React.useState(0);
    const itemRefs = React.useRef<Map<number, HTMLElement>>(new Map());
    const intervalTree = React.useRef(createIntervalTree());
    const measurementQueue = React.useRef(new PriorityQueue<number>());
    const initialMeasurementComplete = React.useRef(false);
    const isScrolling = React.useRef(false);
    const rafId = React.useRef<number | null>(null);

    // Mount effect
    React.useLayoutEffect(() => {
      setMounted(true);
    }, []);

    // Memoized values
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

    const getColumnWidth = React.useCallback(() => {
      if (!collectionRef.current) return 0;
      const containerWidth = collectionRef.current.offsetWidth;
      if (containerWidth === 0) return 0;
      const totalGap = currentGap * (currentColumnCount - 1);
      return Math.floor((containerWidth - totalGap) / currentColumnCount);
    }, [currentColumnCount, currentGap]);

    // Memoized measure callback
    const measureItem = React.useCallback(
      (index: number) => {
        const element = itemRefs.current.get(index);
        if (!element) return null;

        const height = element.offsetHeight;
        if (height > 0) {
          const columnWidth = getColumnWidth();
          measurementsCache.set(element, {
            width: columnWidth,
            height,
          });
          return height;
        }
        return null;
      },
      [getColumnWidth],
    );

    // Optimized layout calculation
    const calculateLayout = React.useCallback(() => {
      if (!mounted || !collectionRef.current) return;

      const columnWidth = getColumnWidth();
      if (columnWidth === 0) return;

      // Process measurements
      let hasNewMeasurements = false;
      while (!measurementQueue.current.isEmpty()) {
        const index = measurementQueue.current.peek();
        if (index !== undefined) {
          const height = measureItem(index);
          if (height !== null) {
            hasNewMeasurements = true;
            measurementQueue.current.remove(index);
          }
        }
      }

      const columnHeights = new Array<number>(currentColumnCount).fill(0);
      const newItems: VisibleItem[] = [];
      const containerRect = collectionRef.current.getBoundingClientRect();
      const viewportTop = window.scrollY - containerRect.top;
      const viewportBottom = viewportTop + window.innerHeight;
      const overscanAmount = Math.max(overscan * window.innerHeight, 1000);

      const visibleRange = {
        start: Math.max(0, viewportTop - overscanAmount),
        end: viewportBottom + overscanAmount * 2,
      };

      // Clear and rebuild interval tree
      intervalTree.current = createIntervalTree();

      // Pre-calculate column gaps
      const columnGaps = new Array(currentColumnCount)
        .fill(0)
        .map((_, i) => Math.round(i * (columnWidth + currentGap)));

      let currentColumn = 0;

      React.Children.forEach(children, (child, index) => {
        if (!React.isValidElement<ItemPropsWithRef>(child)) return;

        const element = itemRefs.current.get(index);
        const isInViewport =
          index >=
            Math.floor(visibleRange.start / itemHeight) * currentColumnCount &&
          index <=
            Math.ceil(visibleRange.end / itemHeight) * currentColumnCount;

        const hasCachedMeasurements = element && measurementsCache.has(element);
        const shouldRender =
          isInViewport ||
          hasCachedMeasurements ||
          initialMeasurementComplete.current;

        if (!shouldRender) return;

        let height = itemHeight;
        if (element) {
          const cached = measurementsCache.get(element);
          if (cached) {
            height = cached.height;
            if (cached.width !== columnWidth) {
              measurementQueue.current.add(index, 0);
            }
          } else {
            const measuredHeight = measureItem(index);
            if (measuredHeight !== null) {
              height = measuredHeight;
            }
          }
        }

        let top: number;
        let left: number;

        if (linear) {
          // Linear mode: left to right, top to bottom
          left = columnGaps[currentColumn] ?? 0;
          const columnHeight = columnHeights[currentColumn] ?? 0;
          top = columnHeight;

          // Update the column height with this item's height
          columnHeights[currentColumn] = columnHeight + height + currentGap;
          // Move to next column, wrap around if needed
          currentColumn = (currentColumn + 1) % currentColumnCount;
        } else {
          // Original masonry mode: shortest column first
          const shortestColumnIndex = columnHeights.indexOf(
            Math.min(...columnHeights),
          );
          left = columnGaps[shortestColumnIndex] ?? 0;
          top = columnHeights[shortestColumnIndex] ?? 0;
          columnHeights[shortestColumnIndex] = top + height + currentGap;
        }

        const itemStyle = getItemStyle(
          top,
          left,
          columnWidth,
          isInViewport,
          child.props.style,
        );

        const itemRef = (element: HTMLElement | null) => {
          if (element) {
            itemRefs.current.set(index, element);
            itemsCache.set(element, { index });
            if (child.props.ref) {
              if (typeof child.props.ref === "function") {
                child.props.ref(element);
              } else if (child.props.ref) {
                child.props.ref.current = element;
              }
            }
          }
        };

        newItems.push(
          React.cloneElement(child, {
            ref: itemRef,
            style: itemStyle,
          }),
        );

        intervalTree.current.insert(top, top + height, index);
        if (element) {
          positionsCache.set(element, { top, left });
        }
      });

      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }

      rafId.current = requestAnimationFrame(() => {
        setItems(newItems);
        setMaxHeight(Math.max(...columnHeights));

        if (!hasNewMeasurements && measurementQueue.current.isEmpty()) {
          initialMeasurementComplete.current = true;
        }
      });
    }, [
      mounted,
      getColumnWidth,
      measureItem,
      currentColumnCount,
      currentGap,
      children,
      itemHeight,
      linear,
      overscan,
    ]);

    const onScroll = React.useCallback(() => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        calculateLayout();
        setTimeout(() => {
          isScrolling.current = false;
        }, 150);
      }
    }, [calculateLayout]);

    // Visibility observer
    useIntersectionObserver(collectionRef, (entries) => {
      if (entries[0]?.isIntersecting) {
        onScroll();
      }
    });

    // Resize observer
    React.useEffect(() => {
      if (!mounted || !collectionRef.current) return;

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0]?.target === collectionRef.current) {
          onScroll();
        }
      });
      resizeObserver.observe(collectionRef.current);

      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("scroll", onScroll);
        if (rafId.current) {
          cancelAnimationFrame(rafId.current);
        }
      };
    }, [mounted, onScroll]);

    // Initial layout
    React.useEffect(() => {
      if (!mounted) return;
      calculateLayout();
    }, [mounted, calculateLayout]);

    const Component = asChild ? Slot : "div";
    const containerStyle = getContainerStyle(mounted, maxHeight);

    return (
      <MasonryContext.Provider
        value={{
          mounted,
        }}
      >
        <Component
          {...rootProps}
          ref={composedRef}
          style={{
            ...containerStyle,
            ...style,
            visibility: initialMeasurementComplete.current
              ? "visible"
              : "hidden",
          }}
        >
          {items}
        </Component>
      </MasonryContext.Provider>
    );
  },
);

Masonry.displayName = ROOT_NAME;

interface MasonryItemProps extends React.ComponentPropsWithoutRef<"div"> {
  asChild?: boolean;
  fallback?: React.ReactNode;
}

const MasonryItem = React.memo(
  React.forwardRef<HTMLDivElement, MasonryItemProps>((props, forwardedRef) => {
    const { asChild, fallback, style, ...itemProps } = props;
    const context = useMasonryContext(ITEM_NAME);

    if (!context.mounted && fallback) {
      return fallback;
    }

    const ItemSlot = asChild ? Slot : "div";

    return <ItemSlot {...itemProps} style={style} ref={forwardedRef} />;
  }),
  (prev, next) => {
    return (
      prev.asChild === next.asChild &&
      prev.fallback === next.fallback &&
      prev.style === next.style
    );
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
