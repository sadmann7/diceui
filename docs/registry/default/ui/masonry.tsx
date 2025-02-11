"use client";

import { useComposedRefs } from "@/lib/composition";
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

// Interval Tree Implementation
type Color = 0 | 1 | 2;
const RED = 0;
const BLACK = 1;
const NIL = 2;

interface TreeNode {
  max: number;
  low: number;
  high: number;
  C: Color;
  P: TreeNode;
  R: TreeNode;
  L: TreeNode;
  index: number;
}

const NULL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  C: NIL,
  index: -1,
  P: undefined as unknown as TreeNode,
  R: undefined as unknown as TreeNode,
  L: undefined as unknown as TreeNode,
};

NULL_NODE.P = NULL_NODE;
NULL_NODE.L = NULL_NODE;
NULL_NODE.R = NULL_NODE;

// Cache Implementation with proper clear methods
class SafeWeakMap<K extends object, V> extends WeakMap<K, V> {
  clear(): void {
    // Create a new WeakMap to effectively clear the old one
    Object.assign(this, new WeakMap<K, V>());
  }
}

const elementsCache = new SafeWeakMap<HTMLElement, number>();
const measurementCache = new SafeWeakMap<
  HTMLElement,
  { width: number; height: number }
>();
const positionCache = new SafeWeakMap<
  HTMLElement,
  { top: number; left: number }
>();

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

// Enhance interval tree with remove operation
function createIntervalTree() {
  const tree = { root: NULL_NODE };
  const indexMap: Record<number, TreeNode> = {};
  let size = 0;

  function findInsertPosition(low: number) {
    let current = tree.root;
    let parent = NULL_NODE;

    while (current !== NULL_NODE) {
      parent = current;
      if (low === parent.low) break;
      current = low < current.low ? current.L : current.R;
    }

    return { parent, found: low === parent.low && parent !== NULL_NODE };
  }

  function insertNode(low: number, high: number, index: number) {
    const { parent, found } = findInsertPosition(low);

    if (found) {
      parent.high = Math.max(parent.high, high);
      updateMax(parent);
      updateMaxUp(parent);
      indexMap[index] = parent;
      return;
    }

    const newNode: TreeNode = {
      low,
      high,
      max: high,
      C: RED,
      P: parent,
      L: NULL_NODE,
      R: NULL_NODE,
      index,
    };

    if (parent === NULL_NODE) {
      tree.root = newNode;
    } else {
      if (newNode.low < parent.low) {
        parent.L = newNode;
      } else {
        parent.R = newNode;
      }
      updateMaxUp(newNode);
    }

    fixInsert(tree, newNode);
    indexMap[index] = newNode;
    size++;
  }

  return {
    insert: insertNode,
    remove(index: number) {
      const nodeToRemove = indexMap[index];
      if (!nodeToRemove) return;
      delete indexMap[index];

      const originalColor = nodeToRemove.C;
      let childNode: TreeNode;

      if (nodeToRemove.L === NULL_NODE) {
        childNode = nodeToRemove.R;
        replaceNode(tree, nodeToRemove, nodeToRemove.R);
      } else if (nodeToRemove.R === NULL_NODE) {
        childNode = nodeToRemove.L;
        replaceNode(tree, nodeToRemove, nodeToRemove.L);
      } else {
        const successor = minimumTree(nodeToRemove.R);
        const successorColor = successor.C;
        childNode = successor.R;

        const isDirectChild = successor.P === nodeToRemove;
        if (isDirectChild) {
          childNode.P = successor;
        } else {
          replaceNode(tree, successor, successor.R);
          successor.R = nodeToRemove.R;
          successor.R.P = successor;
        }

        replaceNode(tree, nodeToRemove, successor);
        successor.L = nodeToRemove.L;
        successor.L.P = successor;
        successor.C = nodeToRemove.C;

        if (successorColor === BLACK) {
          fixRemove(tree, childNode);
        }
      }

      updateMax(childNode);
      updateMaxUp(childNode);

      if (originalColor === BLACK) {
        fixRemove(tree, childNode);
      }
      size--;
    },

    search(
      low: number,
      high: number,
      callback: (index: number, top: number) => void,
    ) {
      const stack = [tree.root];
      while (stack.length !== 0) {
        const node = stack.pop();
        if (!node || node === NULL_NODE || low > node.max) continue;
        if (node.L !== NULL_NODE) stack.push(node.L);
        if (node.R !== NULL_NODE) stack.push(node.R);
        if (node.low <= high && node.high >= low) {
          callback(node.index, node.low);
        }
      }
    },

    size: () => size,
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
  linear?: boolean;
  asChild?: boolean;
  overscanBy?: number;
  scrollingDelay?: number;
  itemHeight?: number;
}

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
      style,
      overscanBy = 2,
      scrollingDelay = 150,
      itemHeight = 300,
      ...rootProps
    } = props;

    const [mounted, setMounted] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const [items, setItems] = React.useState<VisibleItem[]>([]);
    const [maxHeight, setMaxHeight] = React.useState(0);
    const itemRefs = React.useRef<Map<number, HTMLElement>>(new Map());
    const intervalTree = React.useRef(createIntervalTree());
    const isScrolling = React.useRef(false);
    const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);
    const resizeTimeout = React.useRef<NodeJS.Timeout | null>(null);

    React.useLayoutEffect(() => {
      setMounted(true);
      return () => {
        itemRefs.current = new Map();
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

    // Column width calculation
    const getColumnWidth = React.useCallback(() => {
      if (!containerRef.current) return 0;
      const containerWidth = containerRef.current.offsetWidth;
      const totalGap = currentGap * (currentColumnCount - 1);
      return Math.floor((containerWidth - totalGap) / currentColumnCount);
    }, [currentColumnCount, currentGap]);

    // Layout calculation with virtualization
    const calculateLayout = React.useCallback(() => {
      if (!mounted || !containerRef.current) return;

      const columnWidth = getColumnWidth();
      const columnHeights = new Array(currentColumnCount).fill(0);
      const newItems: VisibleItem[] = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      const viewportTop = window.scrollY - containerRect.top;
      const viewportBottom = viewportTop + window.innerHeight;
      const overscanAmount = Math.max(overscanBy * window.innerHeight, 1000);

      const visibleRange = {
        start: Math.max(0, viewportTop - overscanAmount),
        end: viewportBottom + overscanAmount * 2,
      };

      // Clear existing interval tree
      React.Children.forEach(children, (_, index) => {
        intervalTree.current.remove(index);
      });

      React.Children.forEach(children, (child, index) => {
        if (!React.isValidElement<MasonryItemProps>(child)) return;

        const element = itemRefs.current.get(index);
        const isInViewport =
          index >=
            Math.floor(visibleRange.start / itemHeight) * currentColumnCount &&
          index <=
            Math.ceil(visibleRange.end / itemHeight) * currentColumnCount;
        const hasCachedMeasurements = element && measurementCache.has(element);

        if (!isInViewport && !hasCachedMeasurements) return;

        const shortestColumnIndex = columnHeights.indexOf(
          Math.min(...columnHeights),
        );
        const left = Math.round(
          shortestColumnIndex * (columnWidth + currentGap),
        );
        const top = columnHeights[shortestColumnIndex];

        let height = itemHeight;

        if (element) {
          const cached = measurementCache.get(element);
          if (cached && cached.width === columnWidth) {
            height = cached.height;
          } else {
            height = element.offsetHeight;
            measurementCache.set(element, {
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
              elementsCache.set(el, index);
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
            transition: isScrolling.current
              ? "none"
              : "opacity 0.2s ease-in-out",
            opacity: isInViewport ? 1 : 0,
            pointerEvents: isInViewport ? "auto" : "none",
            ...child.props.style,
          },
        };

        // Insert into interval tree with actual position
        intervalTree.current.insert(top, top + height, index);
        if (element) {
          positionCache.set(element, { top, left });
        }

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
      getColumnWidth,
    ]);

    // Scroll handler
    React.useEffect(() => {
      let rafId: number;
      let lastScrollY = window.scrollY;

      const onScroll = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        const currentScrollY = window.scrollY;
        const scrollDelta = Math.abs(currentScrollY - lastScrollY);

        if (scrollDelta > 50) {
          isScrolling.current = true;
          lastScrollY = currentScrollY;

          if (scrollTimeout.current) {
            clearTimeout(scrollTimeout.current);
          }

          rafId = requestAnimationFrame(() => {
            calculateLayout();

            scrollTimeout.current = setTimeout(() => {
              isScrolling.current = false;
              calculateLayout();
            }, scrollingDelay);
          });
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
      };
    }, [calculateLayout, scrollingDelay]);

    // Resize handler
    React.useEffect(() => {
      if (!mounted) return;

      const handleResize = () => {
        measurementCache.clear();
        positionCache.clear();

        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }

        resizeTimeout.current = setTimeout(() => {
          calculateLayout();
        }, 100);
      };

      const resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      window.addEventListener("resize", handleResize);

      return () => {
        if (resizeTimeout.current) {
          clearTimeout(resizeTimeout.current);
        }
        resizeObserver.disconnect();
        window.removeEventListener("resize", handleResize);
      };
    }, [mounted, calculateLayout]);

    // Initial layout
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
