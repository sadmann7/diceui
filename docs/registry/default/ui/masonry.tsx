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

// RAF scheduler implementation
interface RafCallback<T extends unknown[]> {
  (...args: T): void;
  cancel: () => void;
}

function onRafSchedule<T extends unknown[]>(
  callback: (...args: T) => void,
): RafCallback<T> {
  let lastArgs: T = Array(0) as unknown as T;
  let frameId: number | null = null;

  const onCallback: RafCallback<T> = (...args: T) => {
    lastArgs = args;
    if (frameId) return;

    frameId = requestAnimationFrame(() => {
      frameId = null;
      callback(...lastArgs);
    });
  };

  onCallback.cancel = () => {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return onCallback;
}

// Optimized cache implementation
class Cache<K extends object, V> extends WeakMap<K, V> {
  private pendingUpdates = new Set<K>();
  private frameId: number | null = null;

  set(key: K, value: V): this {
    super.set(key, value);
    this.pendingUpdates.add(key);
    this.scheduleUpdate();
    return this;
  }

  private scheduleUpdate = () => {
    if (this.frameId) return;
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null;
      this.pendingUpdates.clear();
    });
  };

  clear(): void {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }
    this.pendingUpdates.clear();
    Object.assign(this, new WeakMap<K, V>());
  }
}

// Replace existing caches with optimized versions
const elementsCache = new Cache<HTMLElement, number>();
const measurementCache = new Cache<
  HTMLElement,
  { width: number; height: number }
>();
const positionCache = new Cache<HTMLElement, { top: number; left: number }>();

// Optimized scroll handling
function useOptimizedScroll(callback: () => void, delay = 16) {
  const timeoutRef = React.useRef<number | null>(null);
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    function onScroll() {
      if (timeoutRef.current) return;
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current();
      }, delay);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
}

// Optimized resize handling
function useOptimizedResize(callback: () => void, delay = 16) {
  const timeoutRef = React.useRef<number | null>(null);
  const callbackRef = React.useRef(callback);
  callbackRef.current = callback;

  React.useEffect(() => {
    function onResize() {
      if (timeoutRef.current) return;
      timeoutRef.current = window.setTimeout(() => {
        timeoutRef.current = null;
        callbackRef.current();
      }, delay);
    }

    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);
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
  const debouncedUpdate = onRafSchedule(() => {
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
  });

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
  overscan?: number;
  scrollingDelay?: number;
  itemHeight?: number;
  linear?: boolean;
  asChild?: boolean;
}

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
      scrollingDelay = 150,
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
    const isScrolling = React.useRef(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const resizeTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const measurementQueue = React.useRef<Set<number>>(new Set());
    const pendingLayout = React.useRef<NodeJS.Timeout | null>(null);
    const initialMeasurementComplete = React.useRef(false);

    // Clear all timeouts on unmount
    React.useEffect(() => {
      return () => {
        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        if (resizeTimeout.current) clearTimeout(resizeTimeout.current);
        if (pendingLayout.current) clearTimeout(pendingLayout.current);
      };
    }, []);

    React.useLayoutEffect(() => {
      setMounted(true);
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

    // Enhanced column width calculation
    const getColumnWidth = React.useCallback(() => {
      if (!collectionRef.current) return 0;
      const containerWidth = collectionRef.current.offsetWidth;
      if (containerWidth === 0) return 0;
      const totalGap = currentGap * (currentColumnCount - 1);
      return Math.floor((containerWidth - totalGap) / currentColumnCount);
    }, [currentColumnCount, currentGap]);

    // Measure a single item
    const measureItem = React.useCallback(
      (index: number) => {
        const element = itemRefs.current.get(index);
        if (!element) return null;

        const height = element.offsetHeight;
        if (height > 0) {
          const columnWidth = getColumnWidth();
          measurementCache.set(element, {
            width: columnWidth,
            height,
          });
          return height;
        }
        return null;
      },
      [getColumnWidth],
    );

    // Process measurement queue with RAF scheduling
    const processMeasurements = React.useCallback(() => {
      if (measurementQueue.current.size === 0) return false;

      let hasNewMeasurements = false;
      for (const index of measurementQueue.current) {
        const height = measureItem(index);
        if (height !== null) {
          hasNewMeasurements = true;
          measurementQueue.current.delete(index);
        }
      }

      return hasNewMeasurements;
    }, [measureItem]);

    // Enhanced layout calculation with RAF scheduling
    const calculateLayout = onRafSchedule(() => {
      if (!mounted || !collectionRef.current) return;

      const columnWidth = getColumnWidth();
      if (columnWidth === 0) return;

      // Process any pending measurements first
      const hasNewMeasurements = processMeasurements();

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
        if (!React.isValidElement<MasonryItemProps>(child)) return;

        const element = itemRefs.current.get(index);
        const isInViewport =
          index >=
            Math.floor(visibleRange.start / itemHeight) * currentColumnCount &&
          index <=
            Math.ceil(visibleRange.end / itemHeight) * currentColumnCount;

        // Queue measurement if needed
        if (element && !measurementCache.has(element)) {
          measurementQueue.current.add(index);
        }

        const hasCachedMeasurements = element && measurementCache.has(element);
        const shouldRender =
          isInViewport ||
          hasCachedMeasurements ||
          initialMeasurementComplete.current;

        if (!shouldRender) return;

        let height = itemHeight;
        if (element) {
          const cached = measurementCache.get(element);
          if (cached) {
            height = cached.height;
            if (cached.width !== columnWidth) {
              measurementQueue.current.add(index);
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

        const itemProps: MasonryItemProps = {
          ref: (el: HTMLElement | null) => {
            if (el) {
              itemRefs.current.set(index, el);
              elementsCache.set(el, index);
              if (!measurementCache.has(el)) {
                measurementQueue.current.add(index);
              }
              if (child.props.ref) {
                if (typeof child.props.ref === "function") {
                  child.props.ref(el);
                } else if (child.props.ref) {
                  child.props.ref.current = el;
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
            willChange: "transform",
            transition: isScrolling.current
              ? "none"
              : "opacity 0.2s ease-in-out",
            opacity: isInViewport ? 1 : 0,
            pointerEvents: isInViewport ? "auto" : "none",
            ...child.props.style,
          },
        };

        intervalTree.current.insert(top, top + height, index);
        if (element) {
          positionCache.set(element, { top, left });
        }

        newItems.push(React.cloneElement(child, itemProps));
      });

      setItems(newItems);
      setMaxHeight(Math.max(...columnHeights));

      // Schedule next measurement/layout if needed
      if (measurementQueue.current.size > 0 || hasNewMeasurements) {
        if (pendingLayout.current) clearTimeout(pendingLayout.current);
        pendingLayout.current = setTimeout(() => {
          calculateLayout();
        }, 50);
      } else {
        initialMeasurementComplete.current = true;
      }
    });

    // Optimized scroll handling
    useOptimizedScroll(() => {
      if (intervalTree.current.size() < items.length) {
        if (pendingLayout.current) clearTimeout(pendingLayout.current);
        pendingLayout.current = setTimeout(() => {
          calculateLayout();
        }, 50);
      }
    });

    // Enhanced resize handling
    useOptimizedResize(() => {
      if (resizeTimeout.current) clearTimeout(resizeTimeout.current);

      // Get container width safely
      const container = collectionRef.current;
      if (!container) return;

      // Immediately update column width and ensure it's a number
      const newColumnWidth = getColumnWidth();
      const containerWidth: number = container.offsetWidth || 0;

      // Only trigger full recalculation if width actually changed and is valid
      if (containerWidth > 0 && newColumnWidth > 0) {
        // Temporarily disable transitions during resize
        container.style.setProperty("transition", "none");

        // Clear only position cache, keep measurements if possible
        positionCache.clear();

        // Immediate layout update with current measurements
        calculateLayout();

        // Schedule a full measurement update
        resizeTimeout.current = setTimeout(() => {
          container.style.removeProperty("transition");
          measurementCache.clear();
          measurementQueue.current.clear();
          initialMeasurementComplete.current = false;
          calculateLayout();
        }, 50);
      }
    }, 16);

    // Initial layout with measurement handling
    React.useEffect(() => {
      if (!mounted) return;

      let retryCount = 0;
      const maxRetries = 5;

      function tryLayout() {
        if (collectionRef.current?.offsetWidth) {
          calculateLayout();
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(tryLayout, 100);
        }
      }

      tryLayout();

      // Ensure all items are eventually measured
      function measureAll() {
        if (measurementQueue.current.size > 0) {
          calculateLayout();
          setTimeout(measureAll, 100);
        }
      }

      setTimeout(measureAll, 100);
    }, [mounted, calculateLayout]);

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
          role="grid"
          {...rootProps}
          ref={composedRef}
          style={{
            ...style,
            height: maxHeight,
            position: "relative",
            minHeight: itemHeight,
            visibility: initialMeasurementComplete.current
              ? "visible"
              : "hidden",
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

    return <ItemSlot role="gridcell" {...itemProps} ref={forwardedRef} />;
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
