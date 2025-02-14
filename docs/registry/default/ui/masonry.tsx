"use client";

import { useComposedRefs } from "@/lib/composition";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const TREE_COLOR = {
  RED: 0,
  BLACK: 1,
  NULL: 2,
} as const;

const TREE_ACTION = {
  DELETE: 0,
  KEEP: 1,
} as const;

type TreeColor = (typeof TREE_COLOR)[keyof typeof TREE_COLOR];
type TreeAction = (typeof TREE_ACTION)[keyof typeof TREE_ACTION];

interface ListNode {
  index: number;
  high: number;
  next: ListNode | null;
}

interface TreeNode {
  max: number;
  low: number;
  high: number;
  color: TreeColor;
  parent: TreeNode;
  right: TreeNode;
  left: TreeNode;
  list: ListNode;
}

const NULL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  color: TREE_COLOR.NULL,
  list: { index: -1, high: 0, next: null },
  parent: undefined as unknown as TreeNode,
  right: undefined as unknown as TreeNode,
  left: undefined as unknown as TreeNode,
};

NULL_NODE.parent = NULL_NODE;
NULL_NODE.left = NULL_NODE;
NULL_NODE.right = NULL_NODE;

type ItemElement = React.ComponentRef<typeof MasonryItem>;

const itemsCache = new Map<ItemElement, { index: number }>();
const measurementsCache = new Map<
  ItemElement,
  { width: number; height: number }
>();
const positionsCache = new Map<ItemElement, { top: number; left: number }>();

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

function updateMax(node: TreeNode) {
  const max = node.high;
  if (node.left === NULL_NODE && node.right === NULL_NODE) {
    node.max = max;
  } else if (node.left === NULL_NODE) {
    node.max = Math.max(node.right.max, max);
  } else if (node.right === NULL_NODE) {
    node.max = Math.max(node.left.max, max);
  } else {
    node.max = Math.max(Math.max(node.left.max, node.right.max), max);
  }
}

function updateMaxUp(node: TreeNode) {
  let current = node;
  while (current.parent !== NULL_NODE) {
    updateMax(current.parent);
    current = current.parent;
  }
}

function rotateLeft(tree: { root: TreeNode }, node: TreeNode) {
  if (node.right === NULL_NODE) return;
  const rightChild = node.right;
  node.right = rightChild.left;
  if (rightChild.left !== NULL_NODE) rightChild.left.parent = node;
  rightChild.parent = node.parent;

  if (node.parent === NULL_NODE) tree.root = rightChild;
  else if (node === node.parent.left) node.parent.left = rightChild;
  else node.parent.right = rightChild;

  rightChild.left = node;
  node.parent = rightChild;

  updateMax(node);
  updateMax(rightChild);
}

function rotateRight(tree: { root: TreeNode }, node: TreeNode) {
  if (node.left === NULL_NODE) return;
  const leftChild = node.left;
  node.left = leftChild.right;
  if (leftChild.right !== NULL_NODE) leftChild.right.parent = node;
  leftChild.parent = node.parent;

  if (node.parent === NULL_NODE) tree.root = leftChild;
  else if (node === node.parent.right) node.parent.right = leftChild;
  else node.parent.left = leftChild;

  leftChild.right = node;
  node.parent = leftChild;

  updateMax(node);
  updateMax(leftChild);
}

function fixInsert(tree: { root: TreeNode }, node: TreeNode) {
  let current = node;
  let uncle: TreeNode;

  while (current.parent.color === TREE_COLOR.RED) {
    if (current.parent === current.parent.parent.left) {
      uncle = current.parent.parent.right;

      if (uncle.color === TREE_COLOR.RED) {
        current.parent.color = TREE_COLOR.BLACK;
        uncle.color = TREE_COLOR.BLACK;
        current.parent.parent.color = TREE_COLOR.RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.right) {
          current = current.parent;
          rotateLeft(tree, current);
        }

        current.parent.color = TREE_COLOR.BLACK;
        current.parent.parent.color = TREE_COLOR.RED;
        rotateRight(tree, current.parent.parent);
      }
    } else {
      uncle = current.parent.parent.left;

      if (uncle.color === TREE_COLOR.RED) {
        current.parent.color = TREE_COLOR.BLACK;
        uncle.color = TREE_COLOR.BLACK;
        current.parent.parent.color = TREE_COLOR.RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.left) {
          current = current.parent;
          rotateRight(tree, current);
        }

        current.parent.color = TREE_COLOR.BLACK;
        current.parent.parent.color = TREE_COLOR.RED;
        rotateLeft(tree, current.parent.parent);
      }
    }
  }
  tree.root.color = TREE_COLOR.BLACK;
}

function minimumTree(node: TreeNode): TreeNode {
  let currentNode = node;
  while (currentNode.left !== NULL_NODE) currentNode = currentNode.left;
  return currentNode;
}

function fixRemove(tree: { root: TreeNode }, node: TreeNode) {
  let current = node;
  let sibling: TreeNode;

  while (current !== NULL_NODE && current.color === TREE_COLOR.BLACK) {
    if (current === current.parent.left) {
      sibling = current.parent.right;

      if (sibling.color === TREE_COLOR.RED) {
        sibling.color = TREE_COLOR.BLACK;
        current.parent.color = TREE_COLOR.RED;
        rotateLeft(tree, current.parent);
        sibling = current.parent.right;
      }

      if (
        sibling.left.color === TREE_COLOR.BLACK &&
        sibling.right.color === TREE_COLOR.BLACK
      ) {
        sibling.color = TREE_COLOR.RED;
        current = current.parent;
      } else {
        if (sibling.right.color === TREE_COLOR.BLACK) {
          sibling.left.color = TREE_COLOR.BLACK;
          sibling.color = TREE_COLOR.RED;
          rotateRight(tree, sibling);
          sibling = current.parent.right;
        }

        sibling.color = current.parent.color;
        current.parent.color = TREE_COLOR.BLACK;
        sibling.right.color = TREE_COLOR.BLACK;
        rotateLeft(tree, current.parent);
        current = tree.root;
      }
    } else {
      sibling = current.parent.left;

      if (sibling.color === TREE_COLOR.RED) {
        sibling.color = TREE_COLOR.BLACK;
        current.parent.color = TREE_COLOR.RED;
        rotateRight(tree, current.parent);
        sibling = current.parent.left;
      }

      if (
        sibling.right.color === TREE_COLOR.BLACK &&
        sibling.left.color === TREE_COLOR.BLACK
      ) {
        sibling.color = TREE_COLOR.RED;
        current = current.parent;
      } else {
        if (sibling.left.color === TREE_COLOR.BLACK) {
          sibling.right.color = TREE_COLOR.BLACK;
          sibling.color = TREE_COLOR.RED;
          rotateLeft(tree, sibling);
          sibling = current.parent.left;
        }

        sibling.color = current.parent.color;
        current.parent.color = TREE_COLOR.BLACK;
        sibling.left.color = TREE_COLOR.BLACK;
        rotateRight(tree, current.parent);
        current = tree.root;
      }
    }
  }

  current.color = TREE_COLOR.BLACK;
}

function replaceNode(
  tree: { root: TreeNode },
  oldNode: TreeNode,
  newNode: TreeNode,
) {
  if (oldNode.parent === NULL_NODE) tree.root = newNode;
  else if (oldNode === oldNode.parent.left) oldNode.parent.left = newNode;
  else oldNode.parent.right = newNode;
  newNode.parent = oldNode.parent;
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

function removeInterval(
  treeNode: TreeNode,
  index: number,
): TreeAction | undefined {
  const node = treeNode.list;
  if (node.index === index) {
    if (node.next === null) return TREE_ACTION.DELETE;
    treeNode.list = node.next;
    return TREE_ACTION.KEEP;
  }

  let prevNode: ListNode = node;
  let currNode = node.next;

  while (currNode !== null) {
    if (currNode.index === index) {
      prevNode.next = currNode.next;
      return TREE_ACTION.KEEP;
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
        x = low < x.low ? x.left : x.right;
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
        color: TREE_COLOR.RED,
        parent: y,
        left: NULL_NODE,
        right: NULL_NODE,
        list: { index, high, next: null },
      };

      if (y === NULL_NODE) tree.root = z;
      else {
        if (z.low < y.low) y.left = z;
        else y.right = z;
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
      if (result === TREE_ACTION.KEEP) {
        pendingUpdates.push([index, z.list.high]);
        debouncedUpdate();
        tree.size--;
        return;
      }

      let y = z;
      let originalColor = y.color;
      let x: TreeNode;

      if (z.left === NULL_NODE) {
        x = z.right;
        replaceNode(tree, z, z.right);
      } else if (z.right === NULL_NODE) {
        x = z.left;
        replaceNode(tree, z, z.left);
      } else {
        y = minimumTree(z.right);
        originalColor = y.color;
        x = y.right;

        if (y.parent === z) x.parent = y;
        else {
          replaceNode(tree, y, y.right);
          y.right = z.right;
          y.right.parent = y;
        }

        replaceNode(tree, z, y);
        y.left = z.left;
        y.left.parent = y;
        y.color = z.color;
      }

      updateMax(x);
      updateMaxUp(x);

      if (originalColor === TREE_COLOR.BLACK) fixRemove(tree, x);
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
        if (node.left !== NULL_NODE) stack.push(node.left);
        if (node.right !== NULL_NODE) stack.push(node.right);

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

function memoize<TArgs extends unknown[], TReturn>(
  resultFn: (...args: TArgs) => TReturn,
): ((...args: TArgs) => TReturn) & { clear: () => void } {
  let cache: {
    lastArgs: TArgs;
    lastResult: TReturn;
  } | null = null;

  function memoized(this: unknown, ...newArgs: TArgs): TReturn {
    if (cache) {
      const lastArgs = cache.lastArgs;
      if (
        newArgs.length === lastArgs.length &&
        newArgs.every((arg, i) => {
          const lastArg = lastArgs[i];
          return (
            arg === lastArg || (Number.isNaN(arg) && Number.isNaN(lastArg))
          );
        })
      ) {
        return cache.lastResult;
      }
    }

    const lastResult = resultFn.apply(this, newArgs);
    cache = {
      lastResult,
      lastArgs: newArgs,
    };

    return lastResult;
  }

  memoized.clear = function clear() {
    cache = null;
  };

  return memoized;
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

const ROOT_NAME = "MasonryRoot";
const ITEM_NAME = "MasonryItem";

const COLUMN_COUNT = 4;
const GAP = 0;

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

const getRootStyle = memoize(
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

interface ItemPropsWithRef extends MasonryItemProps {
  ref?: React.Ref<ItemElement>;
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
    const itemRefs = React.useRef<Map<number, ItemElement>>(new Map());
    const intervalTree = React.useRef(createIntervalTree());
    const measurementQueue = React.useRef(new PriorityQueue<number>());
    const initialMeasurementComplete = React.useRef(false);
    const isScrolling = React.useRef(false);
    const rafId = React.useRef<number | null>(null);

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

    const getColumnWidth = React.useCallback(() => {
      if (!collectionRef.current) return 0;
      const containerWidth = collectionRef.current.offsetWidth;
      if (containerWidth === 0) return 0;
      const totalGap = currentGap * (currentColumnCount - 1);
      return Math.floor((containerWidth - totalGap) / currentColumnCount);
    }, [currentColumnCount, currentGap]);

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

      // Expand the visible range to include overscan
      const visibleRange = {
        start: Math.max(0, viewportTop - overscanAmount * 2), // Double the overscan above
        end: viewportBottom + overscanAmount * 2, // Double the overscan below
      };

      // Pre-calculate column gaps
      const columnGaps = new Array(currentColumnCount)
        .fill(0)
        .map((_, i) => Math.round(i * (columnWidth + currentGap)));

      let currentColumn = 0;
      const processedIndexes = new Set<number>();

      // First pass: Process items that are already in the interval tree
      intervalTree.current.search(
        visibleRange.start,
        visibleRange.end,
        (index) => {
          processedIndexes.add(index);
        },
      );

      // Second pass: Process all items
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
          initialMeasurementComplete.current ||
          processedIndexes.has(index);

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
          true, // Always keep items visible once rendered
          child.props.style,
        );

        const itemRef = (element: ItemElement | null) => {
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

        // Update interval tree
        intervalTree.current.remove(index);
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

    useIntersectionObserver(collectionRef, (entries) => {
      if (entries[0]?.isIntersecting) {
        onScroll();
      }
    });

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

    React.useEffect(() => {
      if (!mounted) return;
      calculateLayout();
    }, [mounted, calculateLayout]);

    const rootStyle = getRootStyle(isScrolling.current, maxHeight);

    const Comp = asChild ? Slot : "div";

    return (
      <MasonryContext.Provider
        value={{
          mounted,
        }}
      >
        <Comp
          {...rootProps}
          ref={composedRef}
          style={{
            ...rootStyle,
            ...style,
            visibility: initialMeasurementComplete.current
              ? "visible"
              : "hidden",
          }}
        >
          {items}
        </Comp>
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
