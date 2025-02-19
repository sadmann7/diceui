"use client";

import { useComposedRefs } from "@/lib/composition";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

type Color = 0 | 1 | 2;
const RED = 0;
const BLACK = 1;
const SENTINEL = 2;

const DELETE = 0;
const KEEP = 1;

interface ListNode {
  index: number;
  high: number;
  next: ListNode | null;
}

interface TreeNode {
  max: number;
  low: number;
  high: number;
  color: Color;
  parent: TreeNode;
  right: TreeNode;
  left: TreeNode;
  list: ListNode;
}

interface Tree {
  root: TreeNode;
  size: number;
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

  if (!prevNode) treeNode.list = { index, high, next: node };
  if (prevNode) prevNode.next = { index, high, next: prevNode.next };

  return true;
}

function removeInterval(treeNode: TreeNode, index: number) {
  let node: ListNode | null = treeNode.list;
  if (node.index === index) {
    if (node.next === null) return DELETE;
    treeNode.list = node.next;
    return KEEP;
  }

  let prevNode: ListNode | undefined = node;
  node = node.next;

  while (node !== null) {
    if (node.index === index) {
      prevNode.next = node.next;
      return KEEP;
    }
    prevNode = node;
    node = node.next;
  }
}

const SENTINEL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  color: SENTINEL,
  parent: undefined as unknown as TreeNode,
  right: undefined as unknown as TreeNode,
  left: undefined as unknown as TreeNode,
  list: undefined as unknown as ListNode,
};

SENTINEL_NODE.parent = SENTINEL_NODE;
SENTINEL_NODE.left = SENTINEL_NODE;
SENTINEL_NODE.right = SENTINEL_NODE;

function updateMax(node: TreeNode) {
  const max = node.high;
  if (node.left === SENTINEL_NODE && node.right === SENTINEL_NODE)
    node.max = max;
  else if (node.left === SENTINEL_NODE)
    node.max = Math.max(node.right.max, max);
  else if (node.right === SENTINEL_NODE)
    node.max = Math.max(node.left.max, max);
  else node.max = Math.max(Math.max(node.left.max, node.right.max), max);
}

function updateMaxUp(node: TreeNode) {
  let x = node;

  while (x.parent !== SENTINEL_NODE) {
    updateMax(x.parent);
    x = x.parent;
  }
}

function rotateLeft(tree: Tree, x: TreeNode) {
  if (x.right === SENTINEL_NODE) return;
  const y = x.right;
  x.right = y.left;
  if (y.left !== SENTINEL_NODE) y.left.parent = x;
  y.parent = x.parent;

  if (x.parent === SENTINEL_NODE) tree.root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;

  y.left = x;
  x.parent = y;

  updateMax(x);
  updateMax(y);
}

function rotateRight(tree: Tree, x: TreeNode) {
  if (x.left === SENTINEL_NODE) return;
  const y = x.left;
  x.left = y.right;
  if (y.right !== SENTINEL_NODE) y.right.parent = x;
  y.parent = x.parent;

  if (x.parent === SENTINEL_NODE) tree.root = y;
  else if (x === x.parent.right) x.parent.right = y;
  else x.parent.left = y;

  y.right = x;
  x.parent = y;

  updateMax(x);
  updateMax(y);
}

function replaceNode(tree: Tree, x: TreeNode, y: TreeNode) {
  if (x.parent === SENTINEL_NODE) tree.root = y;
  else if (x === x.parent.left) x.parent.left = y;
  else x.parent.right = y;
  y.parent = x.parent;
}

function fixRemove(tree: Tree, node: TreeNode) {
  let x = node;
  let w: TreeNode;

  while (x !== SENTINEL_NODE && x.color === BLACK) {
    if (x === x.parent.left) {
      w = x.parent.right;

      if (w.color === RED) {
        w.color = BLACK;
        x.parent.color = RED;
        rotateLeft(tree, x.parent);
        w = x.parent.right;
      }

      if (w.left.color === BLACK && w.right.color === BLACK) {
        w.color = RED;
        x = x.parent;
      } else {
        if (w.right.color === BLACK) {
          w.left.color = BLACK;
          w.color = RED;
          rotateRight(tree, w);
          w = x.parent.right;
        }

        w.color = x.parent.color;
        x.parent.color = BLACK;
        w.right.color = BLACK;
        rotateLeft(tree, x.parent);
        x = tree.root;
      }
    } else {
      w = x.parent.left;

      if (w.color === RED) {
        w.color = BLACK;
        x.parent.color = RED;
        rotateRight(tree, x.parent);
        w = x.parent.left;
      }

      if (w.right.color === BLACK && w.left.color === BLACK) {
        w.color = RED;
        x = x.parent;
      } else {
        if (w.left.color === BLACK) {
          w.right.color = BLACK;
          w.color = RED;
          rotateLeft(tree, w);
          w = x.parent.left;
        }

        w.color = x.parent.color;
        x.parent.color = BLACK;
        w.left.color = BLACK;
        rotateRight(tree, x.parent);
        x = tree.root;
      }
    }
  }

  x.color = BLACK;
}

function minimumTree(node: TreeNode) {
  let current = node;
  while (current.left !== SENTINEL_NODE) {
    current = current.left;
  }
  return current;
}

function fixInsert(tree: Tree, node: TreeNode) {
  let current = node;
  let y: TreeNode;

  while (current.parent.color === RED) {
    if (current.parent === current.parent.parent.left) {
      y = current.parent.parent.right;

      if (y.color === RED) {
        current.parent.color = BLACK;
        y.color = BLACK;
        current.parent.parent.color = RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.right) {
          current = current.parent;
          rotateLeft(tree, current);
        }

        current.parent.color = BLACK;
        current.parent.parent.color = RED;
        rotateRight(tree, current.parent.parent);
      }
    } else {
      y = current.parent.parent.left;

      if (y.color === RED) {
        current.parent.color = BLACK;
        y.color = BLACK;
        current.parent.parent.color = RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.left) {
          current = current.parent;
          rotateRight(tree, current);
        }

        current.parent.color = BLACK;
        current.parent.parent.color = RED;
        rotateLeft(tree, current.parent.parent);
      }
    }
  }
  tree.root.color = BLACK;
}

interface IIntervalTree {
  insert(low: number, high: number, index: number): void;
  remove(index: number): void;
  search(
    low: number,
    high: number,
    callback: (index: number, low: number) => void,
  ): void;
  size: number;
}

function createIntervalTree(): IIntervalTree {
  const tree = {
    root: SENTINEL_NODE,
    size: 0,
  };
  // we know these indexes are a consistent, safe way to make look ups
  // for our case so it's a solid O(1) alternative to
  // the O(log n) searchNode() in typical interval trees
  const indexMap: Record<number, TreeNode> = {};

  return {
    insert(low, high, index) {
      let x: TreeNode = tree.root;
      let y: TreeNode = SENTINEL_NODE;

      while (x !== SENTINEL_NODE) {
        y = x;
        if (low === y.low) break;
        if (low < x.low) x = x.left;
        else x = x.right;
      }

      if (low === y.low && y !== SENTINEL_NODE) {
        if (!addInterval(y, high, index)) return;
        y.high = Math.max(y.high, high);
        updateMax(y);
        updateMaxUp(y);
        indexMap[index] = y;
        tree.size++;
        return;
      }

      const z: TreeNode = {
        low,
        high,
        max: high,
        color: RED,
        parent: y,
        left: SENTINEL_NODE,
        right: SENTINEL_NODE,
        list: { index, high, next: null },
      };

      if (y === SENTINEL_NODE) {
        tree.root = z;
      } else {
        if (z.low < y.low) y.left = z;
        else y.right = z;
        updateMaxUp(z);
      }

      fixInsert(tree, z);
      indexMap[index] = z;
      tree.size++;
    },

    remove(index) {
      const z = indexMap[index];
      if (z === void 0) return;
      delete indexMap[index];

      const intervalResult = removeInterval(z, index);
      if (intervalResult === void 0) return;
      if (intervalResult === KEEP) {
        z.high = z.list.high;
        updateMax(z);
        updateMaxUp(z);
        tree.size--;
        return;
      }

      let y = z;
      let originalYColor = y.color;
      let x: TreeNode;

      if (z.left === SENTINEL_NODE) {
        x = z.right;
        replaceNode(tree, z, z.right);
      } else if (z.right === SENTINEL_NODE) {
        x = z.left;
        replaceNode(tree, z, z.left);
      } else {
        y = minimumTree(z.right);
        originalYColor = y.color;
        x = y.right;

        if (y.parent === z) {
          x.parent = y;
        } else {
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

      if (originalYColor === BLACK) fixRemove(tree, x);
      tree.size--;
    },

    search(low, high, callback) {
      const stack = [tree.root];
      while (stack.length !== 0) {
        const node = stack.pop() as TreeNode;
        if (node === SENTINEL_NODE || low > node.max) continue;
        if (node.left !== SENTINEL_NODE) stack.push(node.left);
        if (node.right !== SENTINEL_NODE) stack.push(node.right);
        if (node.low <= high && node.high >= low) {
          let curr: ListNode | null = node.list;
          while (curr !== null) {
            if (curr.high >= low) callback(curr.index, node.low);
            curr = curr.next;
          }
        }
      }
    },

    get size() {
      return tree.size;
    },
  };
}

type CacheKey = string | number | symbol;
type CacheConstructor = (new () => Cache) | Record<CacheKey, unknown>;

interface Cache<K = CacheKey, V = unknown> {
  set: (k: K, v: V) => V;
  get: (k: K) => V | undefined;
}

function onDeepMemo<T extends unknown[], U>(
  mapConstructors: CacheConstructor[],
  fn: (...args: T) => U,
): (...args: T) => U {
  if (!mapConstructors.length || !mapConstructors[0]) {
    throw new Error("At least one constructor is required");
  }

  function createCache(obj: CacheConstructor): Cache {
    let cache: Cache;
    if (typeof obj === "function") {
      try {
        cache = new (obj as new () => Cache)();
      } catch (_err) {
        cache = new Map<CacheKey, unknown>();
      }
    } else {
      cache = obj as unknown as Cache;
    }
    return {
      set(k: CacheKey, v: unknown): unknown {
        cache.set(k, v);
        return v;
      },
      get(k: CacheKey): unknown | undefined {
        return cache.get(k);
      },
    };
  }

  const depth = mapConstructors.length;
  const baseCache = createCache(mapConstructors[0]);

  let base: Cache | undefined;
  let map: Cache | undefined;
  let node: Cache;
  let i: number;
  const one = depth === 1;

  function get(args: unknown[]): unknown {
    if (depth < 3) {
      const key = args[0] as CacheKey;
      base = baseCache.get(key) as Cache | undefined;
      return one ? base : base?.get(args[1] as CacheKey);
    }

    node = baseCache;
    for (i = 0; i < depth; i++) {
      const next = node.get(args[i] as CacheKey);
      if (!next) return undefined;
      node = next as Cache;
    }
    return node;
  }

  function set(args: unknown[], value: unknown): unknown {
    if (depth < 3) {
      if (one) {
        baseCache.set(args[0] as CacheKey, value);
      } else {
        base = baseCache.get(args[0] as CacheKey) as Cache | undefined;
        if (!base) {
          if (!mapConstructors[1]) {
            throw new Error(
              "Second constructor is required for non-single depth cache",
            );
          }
          map = createCache(mapConstructors[1]);
          map.set(args[1] as CacheKey, value);
          baseCache.set(args[0] as CacheKey, map);
        } else {
          base.set(args[1] as CacheKey, value);
        }
      }
      return value;
    }

    node = baseCache;
    for (i = 0; i < depth - 1; i++) {
      map = node.get(args[i] as CacheKey) as Cache | undefined;
      if (!map) {
        const nextConstructor = mapConstructors[i + 1];
        if (!nextConstructor) {
          throw new Error(`Constructor at index ${i + 1} is required`);
        }
        map = createCache(nextConstructor);
        node.set(args[i] as CacheKey, map);
        node = map;
      } else {
        node = map;
      }
    }
    node.set(args[depth - 1] as CacheKey, value);
    return value;
  }

  return (...args: T): U => {
    const cached = get(args);
    if (cached === undefined) {
      return set(args, fn(...args)) as U;
    }
    return cached as U;
  };
}

export interface Positioner {
  /**
   * The number of columns in the grid
   */
  columnCount: number;
  /**
   * The width of each column in the grid
   */
  columnWidth: number;
  /**
   * Sets the position for the cell at `index` based upon the cell's height
   */
  set: (index: number, height: number) => void;
  /**
   * Gets the `PositionerItem` for the cell at `index`
   */
  get: (index: number) => PositionerItem | undefined;
  /**
   * Updates cells based on their indexes and heights
   * positioner.update([index, height, index, height, index, height...])
   */
  update: (updates: number[]) => void;
  /**
   * Searches the interval tree for grid cells with a `top` value in
   * betwen `lo` and `hi` and invokes the callback for each item that
   * is discovered
   */
  range: (
    lo: number,
    hi: number,
    renderCallback: (index: number, left: number, top: number) => void,
  ) => void;
  /**
   * Returns the number of grid cells in the cache
   */

  size: () => number;
  /**
   * Estimates the total height of the grid
   */

  estimateHeight: (itemCount: number, defaultItemHeight: number) => number;
  /**
   * Returns the height of the shortest column in the grid
   */

  shortestColumn: () => number;
  /**
   * Returns all `PositionerItem` items
   */
  all: () => PositionerItem[];
}

export interface PositionerItem {
  /**
   * This is how far from the top edge of the grid container in pixels the
   * item is placed
   */
  top: number;
  /**
   * This is how far from the left edge of the grid container in pixels the
   * item is placed
   */
  left: number;
  /**
   * This is the height of the grid cell
   */
  height: number;
  /**
   * This is the column number containing the grid cell
   */
  column: number;
}

export interface UsePositionerOptions {
  /**
   * The width of the container you're rendering the grid within, i.e. the container
   * element's `element.offsetWidth`
   */
  width: number;
  /**
   * The minimum column width. The `usePositioner()` hook will automatically size the
   * columns to fill their container based upon the `columnWidth` and `columnGutter` values.
   * It will never render anything smaller than this width unless its container itself is
   * smaller than its value. This property is optional if you're using a static `columnCount`.
   *
   * @default 200
   */
  columnWidth?: number;
  /**
   * This sets the horizontal space between grid columns in pixels. If `rowGutter` is not set, this
   * also sets the vertical space between cells within a column in pixels.
   *
   * @default 0
   */
  columnGutter?: number;
  /**
   * This sets the vertical space between cells within a column in pixels. If not set, the value of
   * `columnGutter` is used instead.
   */
  rowGutter?: number;
  /**
   * By default, `usePositioner()` derives the column count from the `columnWidth`, `columnGutter`,
   * and `width` props. However, in some situations it is nice to be able to override that behavior
   * (e.g. creating a `List` component).
   */
  columnCount?: number;
  /**
   * The upper bound of column count. This property won't work if `columnCount` is set.
   */
  maxColumnCount?: number;
}

function usePositioner(
  {
    width,
    columnWidth = 200,
    columnGutter = 0,
    rowGutter,
    columnCount,
    maxColumnCount,
  }: UsePositionerOptions,
  deps: React.DependencyList = [],
): Positioner {
  const initPositioner = React.useCallback((): Positioner => {
    const [computedColumnWidth, computedColumnCount] = getColumns(
      width,
      columnWidth,
      columnGutter,
      columnCount,
      maxColumnCount,
    );

    // O(log(n)) lookup of cells to render for a given viewport size
    // Store tops and bottoms of each cell for fast intersection lookup.
    const intervalTree = createIntervalTree();
    // Track the height of each column.
    // Layout algorithm below always inserts into the shortest column.
    const columnHeights: number[] = new Array(computedColumnCount).fill(0);
    // Used for O(1) item access
    const items: (PositionerItem | undefined)[] = [];
    // Tracks the item indexes within an individual column
    const columnItems: number[][] = new Array(computedColumnCount)
      .fill(0)
      .map(() => []);

    for (let i = 0; i < computedColumnCount; i++) {
      columnHeights[i] = 0;
      columnItems[i] = [];
    }

    return {
      columnCount: computedColumnCount,
      columnWidth: computedColumnWidth,
      set: (index: number, height = 0) => {
        let column = 0;

        // finds the shortest column and uses it
        for (let i = 1; i < columnHeights.length; i++) {
          const currentHeight = columnHeights[i];
          const shortestHeight = columnHeights[column];
          if (
            currentHeight !== undefined &&
            shortestHeight !== undefined &&
            currentHeight < shortestHeight
          ) {
            column = i;
          }
        }

        const columnHeight = columnHeights[column];
        if (columnHeight === undefined) return;

        const top = columnHeight;
        columnHeights[column] = top + height + (rowGutter ?? columnGutter);

        const columnItemsList = columnItems[column];
        if (!columnItemsList) return;
        columnItemsList.push(index);

        items[index] = {
          left: column * (computedColumnWidth + columnGutter),
          top,
          height,
          column,
        };
        intervalTree.insert(top, top + height, index);
      },
      get: (index: number) => items[index],
      update: (updates: number[]) => {
        const columns: (number | undefined)[] = new Array(computedColumnCount);
        let i = 0;
        let j = 0;

        // determines which columns have items that changed, as well as the minimum index
        // changed in that column, as all items after that index will have their positions
        // affected by the change
        for (; i < updates.length - 1; i++) {
          const currentIndex = updates[i];
          if (typeof currentIndex !== "number") continue;

          const item = items[currentIndex];
          if (!item) continue;

          const nextHeight = updates[++i];
          if (typeof nextHeight !== "number") continue;

          item.height = nextHeight;
          intervalTree.remove(currentIndex);
          intervalTree.insert(item.top, item.top + item.height, currentIndex);
          columns[item.column] =
            columns[item.column] === void 0
              ? currentIndex
              : Math.min(currentIndex, columns[item.column] ?? currentIndex);
        }

        for (i = 0; i < columns.length; i++) {
          // bails out if the column didn't change
          const currentColumn = columns[i];
          if (currentColumn === void 0) continue;

          const itemsInColumn = columnItems[i];
          if (!itemsInColumn) continue;

          // the index order is sorted with certainty so binary search is a great solution
          // here as opposed to Array.indexOf()
          const startIndex = binarySearch(itemsInColumn, currentColumn);
          if (startIndex === -1) continue;

          const currentItemIndex = itemsInColumn[startIndex];
          if (typeof currentItemIndex !== "number") continue;

          const startItem = items[currentItemIndex];
          if (!startItem) continue;

          const currentHeight = columnHeights[i];
          if (typeof currentHeight !== "number") continue;

          columnHeights[i] =
            startItem.top + startItem.height + (rowGutter ?? columnGutter);

          for (j = startIndex + 1; j < itemsInColumn.length; j++) {
            const currentIndex = itemsInColumn[j];
            if (typeof currentIndex !== "number") continue;

            const item = items[currentIndex];
            if (!item) continue;

            const columnHeight = columnHeights[i];
            if (typeof columnHeight !== "number") continue;

            item.top = columnHeight;
            columnHeights[i] =
              item.top + item.height + (rowGutter ?? columnGutter);
            intervalTree.remove(currentIndex);
            intervalTree.insert(item.top, item.top + item.height, currentIndex);
          }
        }
      },
      range: (
        lo: number,
        hi: number,
        renderCallback: (index: number, left: number, top: number) => void,
      ) =>
        intervalTree.search(lo, hi, (index: number, top: number) => {
          const item = items[index];
          if (!item) return;
          renderCallback(index, item.left, top);
        }),
      estimateHeight: (itemCount, defaultItemHeight): number => {
        const tallestColumn = Math.max(0, Math.max.apply(null, columnHeights));

        return itemCount === intervalTree.size
          ? tallestColumn
          : tallestColumn +
              Math.ceil((itemCount - intervalTree.size) / computedColumnCount) *
                defaultItemHeight;
      },
      shortestColumn: () => {
        if (columnHeights.length > 1)
          return Math.min.apply(null, columnHeights);
        return columnHeights[0] || 0;
      },
      size(): number {
        return intervalTree.size;
      },
      all(): PositionerItem[] {
        return items.filter(Boolean) as PositionerItem[];
      },
    };
  }, [
    width,
    columnWidth,
    columnGutter,
    rowGutter,
    columnCount,
    maxColumnCount,
  ]);

  const positionerRef = React.useRef<Positioner | null>(null);
  if (positionerRef.current === null) positionerRef.current = initPositioner();

  const prevDeps = React.useRef(deps);
  const opts = [
    width,
    columnWidth,
    columnGutter,
    rowGutter,
    columnCount,
    maxColumnCount,
  ];
  const prevOpts = React.useRef(opts);
  const optsChanged = !opts.every((item, i) => prevOpts.current[i] === item);

  // Create a new positioner when the dependencies or sizes change
  if (optsChanged || !deps.every((item, i) => prevDeps.current[i] === item)) {
    const prevPositioner = positionerRef.current;
    const positioner = initPositioner();
    prevDeps.current = deps;
    prevOpts.current = opts;

    if (optsChanged) {
      const cacheSize = prevPositioner.size();
      for (let index = 0; index < cacheSize; index++) {
        const pos = prevPositioner.get(index);
        positioner.set(index, pos !== void 0 ? pos.height : 0);
      }
    }

    positionerRef.current = positioner;
  }

  return positionerRef.current;
}

function binarySearch(a: number[], y: number): number {
  let l = 0;
  let h = a.length - 1;

  while (l <= h) {
    const m = (l + h) >>> 1;
    const x = a[m];
    if (x === y) return m;
    if (x === undefined || x <= y) l = m + 1;
    else h = m - 1;
  }

  return -1;
}

function getColumns(
  width = 0,
  minimumWidth = 0,
  gutter = 8,
  initialColumnCount?: number,
  maxColumnCount?: number,
): [number, number] {
  const computedColumnCount =
    initialColumnCount ||
    Math.min(
      Math.floor((width + gutter) / (minimumWidth + gutter)),
      maxColumnCount || Number.POSITIVE_INFINITY,
    ) ||
    1;
  const columnWidth = Math.floor(
    (width - gutter * (computedColumnCount - 1)) / computedColumnCount,
  );
  return [columnWidth, computedColumnCount];
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface DebouncedWindowSizeOptions {
  defaultWidth?: number;
  defaultHeight?: number;
  delayMs?: number;
  leading?: boolean;
}

function useDebouncedWindowSize(
  options: DebouncedWindowSizeOptions = {},
): readonly [number, number] {
  const {
    defaultWidth = 0,
    defaultHeight = 0,
    delayMs = 100,
    leading = false,
  } = options;

  const [size, setSize] = React.useState<[number, number]>(
    typeof document === "undefined"
      ? [defaultWidth, defaultHeight]
      : [
          document.documentElement.clientWidth,
          document.documentElement.clientHeight,
        ],
  );

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const leadingRef = React.useRef(true);

  const setDebouncedSize = React.useCallback(
    (value: [number, number]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (leading && leadingRef.current) {
        leadingRef.current = false;
        setSize(value);
        timeoutRef.current = setTimeout(() => {
          leadingRef.current = true;
        }, delayMs);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        leadingRef.current = true;
        setSize(value);
      }, delayMs);
    },
    [delayMs, leading],
  );

  React.useEffect(() => {
    const handleResize = () =>
      setDebouncedSize([
        document.documentElement.clientWidth,
        document.documentElement.clientHeight,
      ]);

    window?.addEventListener("resize", handleResize);
    window?.addEventListener("orientationchange", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);

    return () => {
      window?.removeEventListener("resize", handleResize);
      window?.removeEventListener("orientationchange", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [setDebouncedSize]);

  return size;
}

type OnRafScheduleReturn<T extends unknown[]> = {
  (...args: T): void;
  cancel: () => void;
};

function onRafSchedule<T extends unknown[]>(
  callback: (...args: T) => void,
): OnRafScheduleReturn<T> {
  let lastArgs: T = [] as unknown as T;
  let frameId: number | null = null;

  function onCallback(...args: T) {
    lastArgs = args;

    if (frameId)
      frameId = requestAnimationFrame(() => {
        frameId = null;
        callback(...lastArgs);
      });
  }

  onCallback.cancel = () => {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return onCallback;
}

function useResizeObserver(positioner: Positioner) {
  const [, setForceUpdate] = React.useState({});
  const forceUpdate = React.useCallback(() => setForceUpdate({}), []);

  const createResizeObserver = onDeepMemo(
    [WeakMap],
    (positioner: Positioner, updater: (updates: number[]) => void) => {
      const updates: number[] = [];
      const itemsCache = new WeakMap<Element, number>();

      const update = onRafSchedule(() => {
        if (updates.length > 0) {
          positioner.update(updates);
          updater(updates);
        }
        updates.length = 0;
      });

      function commonHandler(target: HTMLElement) {
        const height = target.offsetHeight;
        if (height > 0) {
          const index = itemsCache.get(target);
          if (index !== void 0) {
            const position = positioner.get(index);
            if (position !== void 0 && height !== position.height) {
              updates.push(index, height);
            }
          }
        }
        update();
      }

      const handlers = new Map<number, OnRafScheduleReturn<[HTMLElement]>>();
      const handleEntries: ResizeObserverCallback = (entries) => {
        for (const entry of entries) {
          if (!entry) continue;
          const index = itemsCache.get(entry.target);

          if (index === void 0) continue;
          let handler = handlers.get(index);
          if (!handler) {
            handler = onRafSchedule(commonHandler);
            handlers.set(index, handler);
          }
          handler(entry.target as HTMLElement);
        }
      };

      const observer = new ResizeObserver(handleEntries);
      const disconnect = observer.disconnect.bind(observer);
      observer.disconnect = () => {
        disconnect();
        for (const [, handler] of handlers) {
          handler.cancel();
        }
      };

      return observer;
    },
  );

  const resizeObserver = createResizeObserver(positioner, forceUpdate);

  React.useEffect(() => () => resizeObserver.disconnect(), [resizeObserver]);

  return resizeObserver;
}

function useScroller({
  offset = 0,
  fps = 12,
}: {
  offset?: number;
  fps?: number;
} = {}): { scrollTop: number; isScrolling: boolean } {
  const [scrollY, setScrollY] = useThrottle(
    typeof globalThis.window === "undefined"
      ? 0
      : (globalThis.window.scrollY ?? document.documentElement.scrollTop ?? 0),
    { fps, leading: true },
  );

  const onScroll = React.useCallback(() => {
    setScrollY(
      globalThis.window.scrollY ?? document.documentElement.scrollTop ?? 0,
    );
  }, [setScrollY]);

  React.useEffect(() => {
    if (typeof globalThis.window === "undefined") return;
    globalThis.window.addEventListener("scroll", onScroll, { passive: true });

    return () => globalThis.window.removeEventListener("scroll", onScroll);
  }, [onScroll]);

  const [isScrolling, setIsScrolling] = React.useState(false);
  const hasMountedRef = React.useRef(0);

  React.useEffect(() => {
    if (hasMountedRef.current === 1) setIsScrolling(true);
    let didUnsubscribe = false;

    function requestTimeout(fn: () => void, delay: number) {
      const start = performance.now();
      const handle = {
        id: requestAnimationFrame(function tick(timestamp) {
          if (timestamp - start >= delay) {
            fn();
          } else {
            handle.id = requestAnimationFrame(tick);
          }
        }),
      };
      return handle;
    }

    const timeout = requestTimeout(
      () => {
        if (didUnsubscribe) return;
        // This is here to prevent premature bail outs while maintaining high resolution
        // unsets. Without it there will always bee a lot of unnecessary DOM writes to style.
        setIsScrolling(false);
      },
      40 + 1000 / fps,
    );
    hasMountedRef.current = 1;
    return () => {
      didUnsubscribe = true;
      cancelAnimationFrame(timeout.id);
    };
  }, [fps]);

  return { scrollTop: Math.max(0, scrollY - offset), isScrolling };
}

const perf = typeof performance !== "undefined" ? performance : Date;
const now = () => perf.now();

function useThrottle<State>(
  initialState: State | (() => State),
  options: {
    fps?: number;
    leading?: boolean;
  } = {},
): [State, React.Dispatch<React.SetStateAction<State>>] {
  const { fps = 30, leading = false } = options;
  const [state, setState] = React.useState(initialState);
  const latestSetState = React.useRef(setState);
  latestSetState.current = setState;

  const ms = 1000 / fps;
  const prev = React.useRef(0);
  const trailingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearTrailing = React.useCallback(() => {
    if (trailingTimeout.current) {
      clearTimeout(trailingTimeout.current);
    }
  }, []);

  // Reset throttling whenever fps or leading options change.
  React.useEffect(() => {
    return () => {
      prev.current = 0;
      clearTrailing();
    };
  }, [clearTrailing]);

  const throttledSetState = React.useCallback(
    (action: React.SetStateAction<State>) => {
      const rightNow = now();
      const call = () => {
        prev.current = rightNow;
        clearTrailing();
        latestSetState.current(action);
      };
      const current = prev.current;

      // If "leading" is true and this is the first call, execute immediately.
      if (leading && current === 0) {
        return call();
      }

      // If enough time has passed since the last call, call immediately.
      if (rightNow - current > ms) {
        if (current > 0) {
          return call();
        }
        prev.current = rightNow;
      }

      // Otherwise, schedule a trailing call.
      clearTrailing();
      trailingTimeout.current = setTimeout(() => {
        call();
        prev.current = 0;
      }, ms);
    },
    [leading, ms, clearTrailing],
  );

  return [state, throttledSetState];
}

const ROOT_NAME = "MasonryRoot";
const VIEWPORT_NAME = "MasonryViewport";
const ITEM_NAME = "MasonryItem";

const MASONRY_ERROR = {
  [ROOT_NAME]: `\`${ROOT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [VIEWPORT_NAME]: `\`${VIEWPORT_NAME}\` components must be within \`${ROOT_NAME}\``,
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${ROOT_NAME}\``,
} as const;

interface MasonryRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  columnWidth?: number;
  columnGutter?: number;
  rowGutter?: number;
  columnCount?: number;
  maxColumnCount?: number;
  itemHeightEstimate?: number;
  overscanBy?: number;
  scrollFps?: number;
  ssrWidth?: number;
  ssrHeight?: number;
  asChild?: boolean;
}

interface MasonryViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

interface MasonryItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  index: number;
  asChild?: boolean;
}

interface MasonryContextValue {
  positioner: Positioner;
  resizeObserver?: ResizeObserver;
  columnWidth: number;
  onItemRegister: (index: number, element: HTMLElement) => void;
  onItemUnregister: (index: number) => void;
  scrollTop: number;
  isScrolling?: boolean;
  height: number;
  overscanBy: number;
}

const MasonryContext = React.createContext<MasonryContextValue | null>(null);

function useMasonryContext(name: keyof typeof MASONRY_ERROR) {
  const context = React.useContext(MasonryContext);
  if (!context) {
    throw new Error(MASONRY_ERROR[name]);
  }
  return context;
}

const MasonryRoot = React.forwardRef<HTMLDivElement, MasonryRootProps>(
  (props, forwardedRef) => {
    const {
      children,
      columnWidth = 200,
      columnGutter = 0,
      rowGutter,
      columnCount,
      maxColumnCount,
      itemHeightEstimate = 300,
      overscanBy = 2,
      scrollFps = 12,
      ssrWidth,
      ssrHeight,
      asChild,
      ...rootProps
    } = props;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const windowSize = useDebouncedWindowSize({
      defaultWidth: ssrWidth,
      defaultHeight: ssrHeight,
    });

    const [containerPosition, setContainerPosition] = React.useState<{
      offset: number;
      width: number;
    }>({ offset: 0, width: 0 });

    useIsomorphicLayoutEffect(() => {
      if (!containerRef.current) return;

      let offset = 0;
      let container = containerRef.current;

      do {
        offset += container.offsetTop ?? 0;
        container = container.offsetParent as HTMLDivElement;
      } while (container);

      if (
        offset !== containerPosition.offset ||
        containerRef.current.offsetWidth !== containerPosition.width
      ) {
        setContainerPosition({
          offset,
          width: containerRef.current.offsetWidth,
        });
      }
    }, []);

    const positioner = usePositioner({
      width: containerPosition.width ?? windowSize[0],
      columnWidth,
      columnGutter,
      rowGutter,
      columnCount,
      maxColumnCount,
    });
    const resizeObserver = useResizeObserver(positioner);
    const { scrollTop, isScrolling } = useScroller({
      offset: containerPosition.offset,
      fps: scrollFps,
    });

    const itemsMapRef = React.useRef(new Map<number, HTMLElement>());
    const registeredItemsRef = React.useRef(new Set<number>());

    const onItemRegister = React.useCallback(
      (index: number, element: HTMLElement) => {
        if (registeredItemsRef.current.has(index)) return;

        itemsMapRef.current.set(index, element);
        registeredItemsRef.current.add(index);

        if (resizeObserver) {
          resizeObserver.observe(element);
        }
        if (positioner.get(index) === void 0) {
          positioner.set(index, element.offsetHeight);
        }
      },
      [positioner, resizeObserver],
    );

    const onItemUnregister = React.useCallback(
      (index: number) => {
        if (!registeredItemsRef.current.has(index)) return;

        const element = itemsMapRef.current.get(index);
        if (element && resizeObserver) {
          resizeObserver.unobserve(element);
        }
        itemsMapRef.current.delete(index);
        registeredItemsRef.current.delete(index);
      },
      [resizeObserver],
    );

    const contextValue = React.useMemo(
      () => ({
        positioner,
        resizeObserver,
        columnWidth: positioner.columnWidth,
        onItemRegister,
        onItemUnregister,
        scrollTop,
        isScrolling,
        height: windowSize[1],
        overscanBy,
      }),
      [
        positioner,
        resizeObserver,
        onItemRegister,
        onItemUnregister,
        scrollTop,
        isScrolling,
        windowSize,
        overscanBy,
      ],
    );

    const RootSlot = asChild ? Slot : "div";

    return (
      <MasonryContext.Provider value={contextValue}>
        <RootSlot
          {...rootProps}
          ref={composedRef}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            ...rootProps.style,
          }}
        >
          <MasonryViewport>{children}</MasonryViewport>
        </RootSlot>
      </MasonryContext.Provider>
    );
  },
);

MasonryRoot.displayName = ROOT_NAME;

const MasonryViewport = React.forwardRef<HTMLDivElement, MasonryViewportProps>(
  (props, forwardedRef) => {
    const { children, style, ...viewportProps } = props;
    const context = useMasonryContext(VIEWPORT_NAME);

    // Track total items for height calculation
    const totalItems = React.useMemo(() => {
      return React.Children.toArray(children).filter(
        (child): child is React.ReactElement<MasonryItemProps> =>
          React.isValidElement(child) &&
          (child.type === MasonryItem || child.type === Item),
      ).length;
    }, [children]);

    const estimatedHeight = React.useMemo(
      () => context.positioner.estimateHeight(totalItems, 300),
      [context.positioner, totalItems],
    );

    const composedStyle = React.useMemo(
      () => ({
        position: "relative" as const,
        width: "100%",
        maxWidth: "100%",
        height: Math.ceil(estimatedHeight),
        maxHeight: Math.ceil(estimatedHeight),
        willChange: context.isScrolling ? "contents" : undefined,
        pointerEvents: context.isScrolling ? ("none" as const) : undefined,
        ...style,
      }),
      [estimatedHeight, context.isScrolling, style],
    );

    // Calculate visible range with overscan
    const [startIndex, stopIndex] = React.useMemo(() => {
      // Increase overscan to reduce gaps during scrolling
      const overscanPixels = context.height * context.overscanBy;
      const rangeStart = Math.max(0, context.scrollTop - overscanPixels);
      const rangeEnd = context.scrollTop + context.height + overscanPixels;

      const visibleItems: number[] = [];
      context.positioner.range(rangeStart, rangeEnd, (index) => {
        visibleItems.push(index);
      });

      if (!visibleItems.length) {
        // If no items are positioned yet, show first batch with larger initial render
        return [0, Math.min(100, totalItems - 1)];
      }

      // Increase the overscan range for smoother scrolling
      const minVisible = Math.min(...visibleItems);
      const maxVisible = Math.max(...visibleItems);
      const overscanCount = Math.ceil(context.overscanBy * 2); // Double the overscan items

      return [
        Math.max(0, minVisible - overscanCount),
        Math.min(totalItems - 1, maxVisible + overscanCount),
      ];
    }, [
      context.scrollTop,
      context.height,
      context.overscanBy,
      context.positioner,
      totalItems,
    ]);

    // Filter and clone children to apply positioning
    const positionedChildren = React.useMemo(() => {
      const validChildren = React.Children.toArray(children).filter(
        (child): child is React.ReactElement<MasonryItemProps> =>
          React.isValidElement(child) &&
          (child.type === MasonryItem || child.type === Item),
      );

      return validChildren
        .map((child, i) => {
          const index = child.props.index ?? i;
          const position = context.positioner.get(index);

          // Always render items initially to get their heights
          // Expand the render range during scrolling to reduce gaps
          const isInView = index >= startIndex && index <= stopIndex;
          const shouldRender = isInView || !position || context.isScrolling;
          if (!shouldRender) return null;

          return React.cloneElement(child, {
            key: child.key ?? index,
            index, // Ensure index is passed
            style: {
              position: "absolute",
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              width: context.columnWidth,
              visibility: position ? "visible" : "hidden",
              transform: context.isScrolling ? "translateZ(0)" : undefined,
              ...child.props.style,
            },
          });
        })
        .filter(Boolean);
    }, [
      children,
      startIndex,
      stopIndex,
      context.columnWidth,
      context.positioner,
      context.isScrolling,
    ]);

    return (
      <div {...viewportProps} ref={forwardedRef} style={composedStyle}>
        {positionedChildren}
      </div>
    );
  },
);

MasonryViewport.displayName = VIEWPORT_NAME;

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { index, asChild, style, ...itemProps } = props;
    const context = useMasonryContext(ITEM_NAME);
    const combinedRef = useComposedRefs(forwardedRef, (node) => {
      if (node) {
        context.onItemRegister(index, node);
      } else {
        context.onItemUnregister(index);
      }
    });

    const ItemSlot = asChild ? Slot : "div";

    return <ItemSlot {...itemProps} ref={combinedRef} style={style} />;
  },
);

MasonryItem.displayName = ITEM_NAME;

const Root = MasonryRoot;
const Item = MasonryItem;

export {
  MasonryRoot,
  MasonryItem,
  //
  Root,
  Item,
};
