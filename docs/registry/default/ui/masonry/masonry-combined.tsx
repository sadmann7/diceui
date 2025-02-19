"use client";

import { useComposedRefs } from "@/lib/composition";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

type Color = 0 | 1 | 2;
const RED = 0;
const BLACK = 1;
const NIL = 2;

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
  // color
  C: Color;
  // P
  P: TreeNode;
  // right
  R: TreeNode;
  // left
  L: TreeNode;
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

const NULL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  C: NIL,
  P: undefined as unknown as TreeNode,
  R: undefined as unknown as TreeNode,
  L: undefined as unknown as TreeNode,
  list: undefined as unknown as ListNode,
};

NULL_NODE.P = NULL_NODE;
NULL_NODE.L = NULL_NODE;
NULL_NODE.R = NULL_NODE;

function updateMax(node: TreeNode) {
  const max = node.high;
  if (node.L === NULL_NODE && node.R === NULL_NODE) node.max = max;
  else if (node.L === NULL_NODE) node.max = Math.max(node.R.max, max);
  else if (node.R === NULL_NODE) node.max = Math.max(node.L.max, max);
  else node.max = Math.max(Math.max(node.L.max, node.R.max), max);
}

function updateMaxUp(node: TreeNode) {
  let x = node;

  while (x.P !== NULL_NODE) {
    updateMax(x.P);
    x = x.P;
  }
}

function rotateLeft(tree: Tree, x: TreeNode) {
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

function rotateRight(tree: Tree, x: TreeNode) {
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

function replaceNode(tree: Tree, x: TreeNode, y: TreeNode) {
  if (x.P === NULL_NODE) tree.root = y;
  else if (x === x.P.L) x.P.L = y;
  else x.P.R = y;
  y.P = x.P;
}

function fixRemove(tree: Tree, node: TreeNode) {
  let x = node;
  let w: TreeNode;

  while (x !== NULL_NODE && x.C === BLACK) {
    if (x === x.P.L) {
      w = x.P.R;

      if (w.C === RED) {
        w.C = BLACK;
        x.P.C = RED;
        rotateLeft(tree, x.P);
        w = x.P.R;
      }

      if (w.L.C === BLACK && w.R.C === BLACK) {
        w.C = RED;
        x = x.P;
      } else {
        if (w.R.C === BLACK) {
          w.L.C = BLACK;
          w.C = RED;
          rotateRight(tree, w);
          w = x.P.R;
        }

        w.C = x.P.C;
        x.P.C = BLACK;
        w.R.C = BLACK;
        rotateLeft(tree, x.P);
        x = tree.root;
      }
    } else {
      w = x.P.L;

      if (w.C === RED) {
        w.C = BLACK;
        x.P.C = RED;
        rotateRight(tree, x.P);
        w = x.P.L;
      }

      if (w.R.C === BLACK && w.L.C === BLACK) {
        w.C = RED;
        x = x.P;
      } else {
        if (w.L.C === BLACK) {
          w.R.C = BLACK;
          w.C = RED;
          rotateLeft(tree, w);
          w = x.P.L;
        }

        w.C = x.P.C;
        x.P.C = BLACK;
        w.L.C = BLACK;
        rotateRight(tree, x.P);
        x = tree.root;
      }
    }
  }

  x.C = BLACK;
}

function minimumTree(node: TreeNode) {
  let current = node;
  while (current.L !== NULL_NODE) {
    current = current.L;
  }
  return current;
}

function fixInsert(tree: Tree, node: TreeNode) {
  let current = node;
  let y: TreeNode;

  while (current.P.C === RED) {
    if (current.P === current.P.P.L) {
      y = current.P.P.R;

      if (y.C === RED) {
        current.P.C = BLACK;
        y.C = BLACK;
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
      y = current.P.P.L;

      if (y.C === RED) {
        current.P.C = BLACK;
        y.C = BLACK;
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

export interface IIntervalTree {
  insert(low: number, high: number, index: number): void;
  remove(index: number): void;
  search(
    low: number,
    high: number,
    callback: (index: number, low: number) => void,
  ): void;
  size: number;
}

export function createIntervalTree(): IIntervalTree {
  const tree = {
    root: NULL_NODE,
    size: 0,
  };
  // we know these indexes are a consistent, safe way to make look ups
  // for our case so it's a solid O(1) alternative to
  // the O(log n) searchNode() in typical interval trees
  const indexMap: Record<number, TreeNode> = {};

  return {
    insert(low, high, index) {
      let x: TreeNode = tree.root;
      let y: TreeNode = NULL_NODE;

      while (x !== NULL_NODE) {
        y = x;
        if (low === y.low) break;
        if (low < x.low) x = x.L;
        else x = x.R;
      }

      if (low === y.low && y !== NULL_NODE) {
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
        C: RED,
        P: y,
        L: NULL_NODE,
        R: NULL_NODE,
        list: { index, high, next: null },
      };

      if (y === NULL_NODE) {
        tree.root = z;
      } else {
        if (z.low < y.low) y.L = z;
        else y.R = z;
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
      let originalYColor = y.C;
      let x: TreeNode;

      if (z.L === NULL_NODE) {
        x = z.R;
        replaceNode(tree, z, z.R);
      } else if (z.R === NULL_NODE) {
        x = z.L;
        replaceNode(tree, z, z.L);
      } else {
        y = minimumTree(z.R);
        originalYColor = y.C;
        x = y.R;

        if (y.P === z) {
          x.P = y;
        } else {
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

      if (originalYColor === BLACK) fixRemove(tree, x);
      tree.size--;
    },

    search(low, high, callback) {
      const stack = [tree.root];
      while (stack.length !== 0) {
        const node = stack.pop() as TreeNode;
        if (node === NULL_NODE || low > node.max) continue;
        if (node.L !== NULL_NODE) stack.push(node.L);
        if (node.R !== NULL_NODE) stack.push(node.R);
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

export interface MapLike {
  new (...args: unknown[]): unknown;
}

export type CacheConstructor =
  | MapConstructor
  | WeakMapConstructor
  | MapLike
  | Record<string | number | symbol, unknown>;

interface Cache<K = CacheKey, V = unknown> {
  set: (k: K, v: V) => V;
  get: (k: K) => V | undefined;
}

type CacheKey = string | number | symbol;

const createCache = (obj: CacheConstructor): Cache => {
  try {
    // @ts-expect-error - This is a valid way to create a cache
    return new obj();
  } catch (_err) {
    const cache = new Map<CacheKey, unknown>();

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
};

interface MemoResult {
  s: (args: unknown[], value: unknown) => unknown;
  g: (args: unknown[]) => unknown;
}

const memo = (constructors: CacheConstructor[]): MemoResult => {
  if (!constructors.length || !constructors[0]) {
    throw new Error("At least one constructor is required");
  }

  const depth = constructors.length;
  const baseCache = createCache(constructors[0]);
  let base: Cache | undefined;
  let map: Cache | undefined;
  let i: number;
  let node: Cache = baseCache;
  const one = depth === 1;

  const g1 = (args: unknown[]): unknown => {
    const key = args[0] as CacheKey;
    base = baseCache.get(key) as Cache | undefined;
    return one ? base : base?.get(args[1] as CacheKey);
  };

  const s1 = (args: unknown[], value: unknown): unknown => {
    if (one) {
      baseCache.set(args[0] as CacheKey, value);
    } else {
      base = baseCache.get(args[0] as CacheKey) as Cache | undefined;
      if (!base) {
        if (!constructors[1]) {
          throw new Error(
            "Second constructor is required for non-single depth cache",
          );
        }
        map = createCache(constructors[1]);
        map.set(args[1] as CacheKey, value);
        baseCache.set(args[0] as CacheKey, map);
      } else {
        base.set(args[1] as CacheKey, value);
      }
    }
    return value;
  };

  const g2 = (args: unknown[]): unknown => {
    node = baseCache;
    for (i = 0; i < depth; i++) {
      const next = node.get(args[i] as CacheKey);
      if (!next) return undefined;
      node = next as Cache;
    }
    return node;
  };

  const s2 = (args: unknown[], value: unknown): unknown => {
    node = baseCache;
    for (i = 0; i < depth - 1; i++) {
      map = node.get(args[i] as CacheKey) as Cache | undefined;
      if (!map) {
        const nextConstructor = constructors[i + 1];
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
  };

  return depth < 3 ? { g: g1, s: s1 } : { g: g2, s: s2 };
};

const trieMemoize = <T extends unknown[], U>(
  mapConstructors: CacheConstructor[],
  fn: (...args: T) => U,
): ((...args: T) => U) => {
  const { g, s } = memo(mapConstructors);

  return (...args: T): U => {
    const result = g(args);
    if (result === undefined) {
      return s(args, fn(...args)) as U;
    }
    return result as U;
  };
};

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

export function usePositioner(
  {
    width,
    columnWidth = 200,
    columnGutter = 0,
    rowGutter,
    columnCount,
    maxColumnCount,
  }: UsePositionerOptions,
  deps: React.DependencyList = emptyArr,
): Positioner {
  const initPositioner = (): Positioner => {
    const [computedColumnWidth, computedColumnCount] = getColumns(
      width,
      columnWidth,
      columnGutter,
      columnCount,
      maxColumnCount,
    );
    return createPositioner(
      computedColumnCount,
      computedColumnWidth,
      columnGutter,
      rowGutter ?? columnGutter,
    );
  };
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

  if (typeof process !== "undefined" && process.env.NODE_ENV !== "production") {
    if (deps.length !== prevDeps.current.length) {
      throw new Error(
        "usePositioner(): The length of your dependencies array changed.",
      );
    }
  }

  // Create a new positioner when the dependencies or sizes change
  // Thanks to https://github.com/khmm12 for pointing this out
  // https://github.com/jaredLunde/masonic/pull/41
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

/**
 * Creates a cell positioner for the `useMasonry()` hook. The `usePositioner()` hook uses
 * this utility under the hood.
 *
 * @param columnCount - The number of columns in the grid
 * @param columnWidth - The width of each column in the grid
 * @param columnGutter - The amount of horizontal space between columns in pixels.
 * @param rowGutter - The amount of vertical space between cells within a column in pixels (falls back
 * to `columnGutter`).
 */
export const createPositioner = (
  columnCount: number,
  columnWidth: number,
  columnGutter = 0,
  rowGutter = columnGutter,
): Positioner => {
  // O(log(n)) lookup of cells to render for a given viewport size
  // Store tops and bottoms of each cell for fast intersection lookup.
  const intervalTree = createIntervalTree();
  // Track the height of each column.
  // Layout algorithm below always inserts into the shortest column.
  const columnHeights: number[] = new Array(columnCount).fill(0);
  // Used for O(1) item access
  const items: (PositionerItem | undefined)[] = [];
  // Tracks the item indexes within an individual column
  const columnItems: number[][] = new Array(columnCount).fill(0).map(() => []);

  for (let i = 0; i < columnCount; i++) {
    columnHeights[i] = 0;
    columnItems[i] = [];
  }

  return {
    columnCount,
    columnWidth,
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
      columnHeights[column] = top + height + rowGutter;

      const columnItemsList = columnItems[column];
      if (!columnItemsList) return;
      columnItemsList.push(index);

      items[index] = {
        left: column * (columnWidth + columnGutter),
        top,
        height,
        column,
      };
      intervalTree.insert(top, top + height, index);
    },
    get: (index: number) => items[index],
    update: (updates: number[]) => {
      const columns: (number | undefined)[] = new Array(columnCount);
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

        columnHeights[i] = startItem.top + startItem.height + rowGutter;

        for (j = startIndex + 1; j < itemsInColumn.length; j++) {
          const currentIndex = itemsInColumn[j];
          if (typeof currentIndex !== "number") continue;

          const item = items[currentIndex];
          if (!item) continue;

          const columnHeight = columnHeights[i];
          if (typeof columnHeight !== "number") continue;

          item.top = columnHeight;
          columnHeights[i] = item.top + item.height + rowGutter;
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
            Math.ceil((itemCount - intervalTree.size) / columnCount) *
              defaultItemHeight;
    },
    shortestColumn: () => {
      if (columnHeights.length > 1) return Math.min.apply(null, columnHeights);
      return columnHeights[0] || 0;
    },
    size(): number {
      return intervalTree.size;
    },
    all(): PositionerItem[] {
      return items.filter(Boolean) as PositionerItem[];
    },
  };
};

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

/* istanbul ignore next */
const binarySearch = (a: number[], y: number): number => {
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
};

const getColumns = (
  width = 0,
  minimumWidth = 0,
  gutter = 8,
  initialColumnCount?: number,
  maxColumnCount?: number,
): [number, number] => {
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
};

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const emptyArr: [] = [];

export interface ContainerPosition {
  /**
   * The distance in pixels between the top of the element in `elementRef` and the top of
   * the `document.documentElement`.
   */
  offset: number;
  /**
   * The `offsetWidth` of the element in `elementRef`.
   */
  width: number;
}

/**
 * A hook for measuring the width of the grid container, as well as its distance
 * from the top of the document. These values are necessary to correctly calculate the number/width
 * of columns to render, as well as the number of rows to render.
 *
 * @param elementRef - A `ref` object created by `React.useRef()`. That ref should be provided to the
 *   `containerRef` property in `useMasonry()`.
 * @param deps - You can force this hook to recalculate the `offset` and `width` whenever this
 *   dependencies list changes. A common dependencies list might look like `[windowWidth, windowHeight]`,
 *   which would force the hook to recalculate any time the size of the browser `window` changed.
 */
function useContainerPosition(
  elementRef: React.MutableRefObject<HTMLElement | null>,
  deps: React.DependencyList = emptyArr,
): ContainerPosition {
  const [containerPosition, setContainerPosition] =
    React.useState<ContainerPosition>({ offset: 0, width: 0 });

  useIsomorphicLayoutEffect(() => {
    const { current } = elementRef;
    if (current !== null) {
      let offset = 0;
      let el = current;

      do {
        offset += el.offsetTop || 0;
        el = el.offsetParent as HTMLElement;
      } while (el);

      if (
        offset !== containerPosition.offset ||
        current.offsetWidth !== containerPosition.width
      ) {
        setContainerPosition({
          offset,
          width: current.offsetWidth,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return containerPosition;
}

interface DebounceOptions {
  wait?: number;
  leading?: boolean;
}

export function useDebounceState<T>(
  initialState: T | (() => T),
  options: DebounceOptions = {},
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { wait = 100, leading = false } = options;
  const [state, setState] = React.useState<T>(initialState);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const leadingRef = React.useRef(true);

  const debouncedSetState = React.useCallback(
    (value: T | ((prevState: T) => T)) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (leading && leadingRef.current) {
        leadingRef.current = false;
        setState(value);
        timeoutRef.current = setTimeout(() => {
          leadingRef.current = true;
        }, wait);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        leadingRef.current = true;
        setState(value);
      }, wait);
    },
    [wait, leading],
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, debouncedSetState];
}

const emptyObj = {};

function useForceUpdate() {
  const setState = React.useState(emptyObj)[1];
  return React.useRef(() => setState({})).current;
}

function useLatest<Value>(value: Value): React.RefObject<Value> {
  const ref = React.useRef<Value>(value);
  ref.current = value;
  return ref;
}

interface DebouncedWindowSizeOptions {
  initialWidth?: number;
  initialHeight?: number;
  wait?: number;
  leading?: boolean;
}

const getSize = () =>
  [
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  ] as const;

export const useWindowSize = (
  options: DebouncedWindowSizeOptions = emptyObj,
): readonly [number, number] => {
  const { wait, leading, initialWidth = 0, initialHeight = 0 } = options;
  const [size, setDebouncedSize] = useDebounceState<readonly [number, number]>(
    typeof document === "undefined" ? [initialWidth, initialHeight] : getSize(),
    { wait, leading },
  );

  const win = typeof window === "undefined" ? null : window;
  const wv =
    win && typeof win.visualViewport !== "undefined"
      ? win.visualViewport
      : null;

  React.useEffect(() => {
    const setSize = () => setDebouncedSize(getSize());

    win?.addEventListener("resize", setSize);
    wv?.addEventListener("resize", setSize);
    win?.addEventListener("orientationchange", setSize);

    return () => {
      win?.removeEventListener("resize", setSize);
      wv?.removeEventListener("resize", setSize);
      win?.removeEventListener("orientationchange", setSize);
    };
  }, [setDebouncedSize]);

  return size;
};

type WrapperFn<T extends unknown[]> = {
  (...args: T): void;
  cancel: () => void;
};

function rafSchd<T extends unknown[]>(fn: (...args: T) => void): WrapperFn<T> {
  let lastArgs: T = [] as unknown as T;
  let frameId: number | null = null;

  const wrapperFn = (...args: T): void => {
    // Always capture the latest value
    lastArgs = args;

    // There is already a frame queued
    if (frameId) {
      return;
    }

    // Schedule a new frame
    frameId = requestAnimationFrame(() => {
      frameId = null;
      fn(...lastArgs);
    });
  };

  // Adding cancel property to result function
  wrapperFn.cancel = () => {
    if (!frameId) {
      return;
    }

    cancelAnimationFrame(frameId);
    frameId = null;
  };

  return wrapperFn;
}

/**
 * Creates a resize observer that forces updates to the grid cell positions when mutations are
 * made to cells affecting their height.
 *
 * @param positioner - The masonry cell positioner created by the `usePositioner()` hook.
 */
export function useResizeObserver(positioner: Positioner) {
  const forceUpdate = useForceUpdate();
  const resizeObserver = createResizeObserver(positioner, forceUpdate);
  // Cleans up the resize observers when they change or the
  // component unmounts
  React.useEffect(() => () => resizeObserver.disconnect(), [resizeObserver]);
  return resizeObserver;
}

/**
 * Creates a resize observer that fires an `updater` callback whenever the height of
 * one or many cells change. The `useResizeObserver()` hook is using this under the hood.
 *
 * @param positioner - A cell positioner created by the `usePositioner()` hook or the `createPositioner()` utility
 * @param updater - A callback that fires whenever one or many cell heights change.
 */
export const createResizeObserver = trieMemoize(
  [WeakMap],
  // TODO: figure out a way to test this
  /* istanbul ignore next */
  (positioner: Positioner, updater: (updates: number[]) => void) => {
    const updates: number[] = [];
    const elementsCache = new WeakMap<Element, number>();

    const update = rafSchd(() => {
      if (updates.length > 0) {
        // Updates the size/positions of the cell with the resize
        // observer updates
        positioner.update(updates);
        updater(updates);
      }
      updates.length = 0;
    });

    const commonHandler = (target: HTMLElement) => {
      const height = target.offsetHeight;
      if (height > 0) {
        const index = elementsCache.get(target);
        if (index !== void 0) {
          const position = positioner.get(index);
          if (position !== void 0 && height !== position.height) {
            updates.push(index, height);
          }
        }
      }
      update();
    };

    const handlers = new Map<number, WrapperFn<[HTMLElement]>>();
    const handleEntries: ResizeObserverCallback = (entries) => {
      for (const entry of entries) {
        if (!entry) continue;
        const index = elementsCache.get(entry.target);

        if (index === void 0) continue;
        let handler = handlers.get(index);
        if (!handler) {
          handler = rafSchd(commonHandler);
          handlers.set(index, handler);
        }
        handler(entry.target as HTMLElement);
      }
    };

    const ro = new ResizeObserver(handleEntries);
    // Overrides the original disconnect to include cancelling handling the entries.
    // Ideally this would be its own method but that would result in a breaking
    // change.
    const disconnect = ro.disconnect.bind(ro);
    ro.disconnect = () => {
      disconnect();
      for (const [, handler] of handlers) {
        handler.cancel();
      }
    };

    return ro;
  },
);

const defaultState = {
  index: void 0,
  position: void 0,
  prevTop: void 0,
} as const;

export type UseScrollToIndexOptions = {
  /**
   * The window element or a React ref for the window element. That is,
   * this is the grid container.
   *
   * @default window
   */
  element?: Window | HTMLElement | React.RefObject<HTMLElement> | null;
  /**
   * Sets the vertical alignment of the cell within the grid container.
   *
   * @default "top"
   */
  align?: "center" | "top" | "bottom";
  /**
   * The height of the grid.
   *
   * @default window.innerHeight
   */
  height?: number;
  /**
   * The vertical space in pixels between the top of the grid container and the top
   * of the window.
   *
   * @default 0
   */
  offset?: number;
};

/**
 * A hook that creates a callback for scrolling to a specific index in
 * the "items" array.
 *
 * @param positioner - A positioner created by the `usePositioner()` hook
 * @param options - Configuration options
 */
export function useScrollToIndex(
  positioner: Positioner,
  options: UseScrollToIndexOptions,
) {
  const {
    align = "top",
    element = typeof window !== "undefined" && window,
    offset = 0,
    height = typeof window !== "undefined" ? window.innerHeight : 0,
  } = options;
  const latestOptions = useLatest({
    positioner,
    element,
    align,
    offset,
    height,
  } as const);
  const getTarget = React.useRef(() => {
    const latestElement = latestOptions.current.element;
    return latestElement && "current" in latestElement
      ? latestElement.current
      : latestElement;
  }).current;
  const [state, dispatch] = React.useReducer(
    (
      state: {
        position: PositionerItem | undefined;
        index: number | undefined;
        prevTop: number | undefined;
      },
      action:
        | { type: "scrollToIndex"; value: number | undefined }
        | { type: "setPosition"; value: PositionerItem | undefined }
        | { type: "setPrevTop"; value: number | undefined }
        | { type: "reset" },
    ) => {
      const nextState = {
        position: state.position,
        index: state.index,
        prevTop: state.prevTop,
      };

      /* istanbul ignore next */
      if (action.type === "scrollToIndex") {
        return {
          position: latestOptions.current.positioner.get(action.value ?? -1),
          index: action.value,
          prevTop: void 0,
        };
      }
      if (action.type === "setPosition") {
        nextState.position = action.value;
      }
      if (action.type === "setPrevTop") {
        nextState.prevTop = action.value;
      }
      if (action.type === "reset") {
        return defaultState;
      }

      return nextState;
    },
    defaultState,
  );
  const throttledDispatch = useThrottleCallback(dispatch, 15);

  // If we find the position along the way we can immediately take off
  // to the correct spot.
  useEvent(getTarget() as Window, "scroll", () => {
    if (!state.position && state.index) {
      const position = latestOptions.current.positioner.get(state.index);

      if (position) {
        dispatch({ type: "setPosition", value: position });
      }
    }
  });

  // If the top changes out from under us in the case of dynamic cells, we
  // want to keep following it.
  const currentTop =
    state.index !== void 0 &&
    latestOptions.current.positioner.get(state.index)?.top;

  React.useEffect(() => {
    const target = getTarget();
    if (!target) return;
    const { height, align, offset, positioner } = latestOptions.current;

    if (state.position) {
      let scrollTop = state.position.top;

      if (align === "bottom") {
        scrollTop = scrollTop - height + state.position.height;
      } else if (align === "center") {
        scrollTop -= (height - state.position.height) / 2;
      }

      target.scrollTo(0, Math.max(0, (scrollTop += offset)));
      // Resets state after 400ms, an arbitrary time I determined to be
      // still visually pleasing if there is a slow network reply in dynamic
      // cells
      let didUnsubscribe = false;
      const timeout = setTimeout(
        () => !didUnsubscribe && dispatch({ type: "reset" }),
        400,
      );
      return () => {
        didUnsubscribe = true;
        clearTimeout(timeout);
      };
    }
    if (state.index !== void 0) {
      // Estimates the top based upon the average height of current cells
      let estimatedTop =
        (positioner.shortestColumn() / positioner.size()) * state.index;
      if (state.prevTop)
        estimatedTop = Math.max(estimatedTop, state.prevTop + height);
      target.scrollTo(0, estimatedTop);
      throttledDispatch({ type: "setPrevTop", value: estimatedTop });
    }
  }, [currentTop, state, latestOptions, getTarget, throttledDispatch]);

  return React.useRef((index: number) => {
    dispatch({ type: "scrollToIndex", value: index });
  }).current;
}

const requestTimeout = (fn: () => void, delay: number) => {
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
};

const clearRequestTimeout = (handle: { id: number }) => {
  cancelAnimationFrame(handle.id);
};

/**
 * A hook for tracking whether the `window` is currently being scrolled and it's scroll position on
 * the y-axis. These values are used for determining which grid cells to render and when
 * to add styles to the masonry container that maximize scroll performance.
 *
 * @param offset - The vertical space in pixels between the top of the grid container and the top
 *  of the browser `document.documentElement`.
 * @param fps - This determines how often (in frames per second) to update the scroll position of the
 *  browser `window` in state, and as a result the rate the masonry grid recalculates its visible cells.
 *  The default value of `12` has been very reasonable in my own testing, but if you have particularly
 *  heavy `render` components it may be prudent to reduce this number.
 */
export function useScroller(
  offset = 0,
  fps = 12,
): { scrollTop: number; isScrolling: boolean } {
  const scrollTop = useWindowScroll(fps);
  const [isScrolling, setIsScrolling] = React.useState(false);
  const didMount = React.useRef(0);

  React.useEffect(() => {
    if (didMount.current === 1) setIsScrolling(true);
    let didUnsubscribe = false;
    const to = requestTimeout(
      () => {
        if (didUnsubscribe) return;
        // This is here to prevent premature bail outs while maintaining high resolution
        // unsets. Without it there will always bee a lot of unnecessary DOM writes to style.
        setIsScrolling(false);
      },
      40 + 1000 / fps,
    );
    didMount.current = 1;
    return () => {
      didUnsubscribe = true;
      clearRequestTimeout(to);
    };
  }, [fps, scrollTop]);

  return { scrollTop: Math.max(0, scrollTop - offset), isScrolling };
}

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;
type EventTarget = HTMLElement | Document | Window | null;
type EventType = keyof EventMap;

export function useEvent<K extends EventType>(
  target: EventTarget | { current: EventTarget },
  type: K,
  listener: (ev: EventMap[K]) => void,
  cleanup?: () => void,
): void {
  const storedListener = React.useRef(listener);
  const storedCleanup = React.useRef(cleanup);

  React.useEffect(() => {
    storedListener.current = listener;
    storedCleanup.current = cleanup;
  });

  React.useEffect(() => {
    const targetEl = target && "current" in target ? target.current : target;
    if (!targetEl) return;

    let didUnsubscribe = 0;
    const eventHandler = ((ev: Event) => {
      if (didUnsubscribe) return;
      storedListener.current(ev as EventMap[K]);
    }) as EventListener;

    targetEl.addEventListener(type, eventHandler);

    return () => {
      didUnsubscribe = 1;
      targetEl.removeEventListener(type, eventHandler);
      storedCleanup.current?.();
    };
  }, [target, type]);
}

const win = typeof window === "undefined" ? null : window;
const getScrollY = (): number =>
  (win as Window).scrollY !== void 0
    ? (win as Window).scrollY
    : (win as Window).pageYOffset === void 0
      ? 0
      : (win as Window).pageYOffset;

export const useWindowScroll = (fps = 30): number => {
  const state = useThrottle(
    typeof window === "undefined" ? 0 : getScrollY,
    fps,
    true,
  );
  useEvent(win, "scroll", (): void => state[1](getScrollY()));
  return state[0];
};

const perf = typeof performance !== "undefined" ? performance : Date;
const now = () => perf.now();

export function useThrottleCallback<CallbackArguments extends unknown[]>(
  callback: (...args: CallbackArguments) => void,
  fps = 30,
  leading = false,
): (...args: CallbackArguments) => void {
  const storedCallback = useLatest(callback);
  const ms = 1000 / fps;
  const prev = React.useRef(0);
  const trailingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const clearTrailing = () =>
    trailingTimeout.current && clearTimeout(trailingTimeout.current);
  const deps = [fps, leading, storedCallback];

  // Reset any time the deps change
  React.useEffect(
    () => () => {
      prev.current = 0;
      clearTrailing();
    },
    deps,
  );

  return React.useCallback((...args: CallbackArguments) => {
    const rightNow = now();
    const call = () => {
      prev.current = rightNow;
      clearTrailing();
      storedCallback.current.apply(null, args);
    };
    const current = prev.current;
    // leading
    if (leading && current === 0) return call();
    // body
    if (rightNow - current > ms) {
      if (current > 0) return call();
      prev.current = rightNow;
    }
    // trailing
    clearTrailing();

    trailingTimeout.current = setTimeout(() => {
      call();
      prev.current = 0;
    }, ms);
  }, deps);
}

export function useThrottle<State>(
  initialState: State | (() => State),
  fps?: number,
  leading?: boolean,
): [State, React.Dispatch<React.SetStateAction<State>>] {
  const state = React.useState<State>(initialState);
  return [state[0], useThrottleCallback(state[1], fps, leading)];
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
    const windowSize = useWindowSize({
      initialWidth: ssrWidth,
      initialHeight: ssrHeight,
    });
    const containerPos = useContainerPosition(containerRef, windowSize);
    const positioner = usePositioner({
      width: containerPos.width || windowSize[0],
      columnWidth,
      columnGutter,
      rowGutter,
      columnCount,
      maxColumnCount,
    });
    const resizeObserver = useResizeObserver(positioner);
    const { scrollTop, isScrolling } = useScroller(
      containerPos.offset,
      scrollFps,
    );

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
        />
      </MasonryContext.Provider>
    );
  },
);

MasonryRoot.displayName = ROOT_NAME;

const MasonryViewport = React.forwardRef<HTMLDivElement, MasonryViewportProps>(
  (props, forwardedRef) => {
    const { asChild, children, style, ...viewportProps } = props;
    const context = useMasonryContext(VIEWPORT_NAME);

    // Track total items for height calculation
    const totalItems = React.useMemo(() => {
      return React.Children.toArray(children).filter(
        (child) =>
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
      const rangeStart = Math.max(0, context.scrollTop - context.overscanBy);
      const rangeEnd = context.scrollTop + context.height + context.overscanBy;

      const visibleItems: number[] = [];
      context.positioner.range(rangeStart, rangeEnd, (index) => {
        visibleItems.push(index);
      });

      if (!visibleItems.length) {
        // If no items are positioned yet, show first batch
        return [0, Math.min(50, totalItems - 1)];
      }
      return [
        Math.max(0, Math.min(...visibleItems) - 5),
        Math.min(totalItems - 1, Math.max(...visibleItems) + 5),
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
          const isInView = index >= startIndex && index <= stopIndex;
          if (!isInView && position) return null;

          return React.cloneElement(child, {
            key: child.key ?? index,
            index, // Ensure index is passed
            style: {
              position: "absolute",
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              width: context.columnWidth,
              visibility: position ? "visible" : "hidden",
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
    ]);

    const ViewportSlot = asChild ? Slot : "div";

    return (
      <ViewportSlot {...viewportProps} ref={forwardedRef} style={composedStyle}>
        {positionedChildren}
      </ViewportSlot>
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
const Viewport = MasonryViewport;
const Item = MasonryItem;

export {
  MasonryRoot,
  MasonryViewport,
  MasonryItem,
  //
  Root,
  Viewport,
  Item,
};
