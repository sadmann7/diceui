"use client";

import { useComposedRefs } from "@/lib/composition";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

const NODE_COLOR = {
  RED: 0,
  BLACK: 1,
  SENTINEL: 2,
} as const;

const NODE_OPERATION = {
  REMOVE: 0,
  PRESERVE: 1,
} as const;

type NodeColor = (typeof NODE_COLOR)[keyof typeof NODE_COLOR];
type NodeOperation = (typeof NODE_OPERATION)[keyof typeof NODE_OPERATION];

interface ListNode {
  index: number;
  high: number;
  next: ListNode | null;
}

interface TreeNode {
  max: number;
  low: number;
  high: number;
  color: NodeColor;
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

function removeInterval(
  treeNode: TreeNode,
  index: number,
): NodeOperation | undefined {
  let node: ListNode | null = treeNode.list;
  if (node.index === index) {
    if (node.next === null) return NODE_OPERATION.REMOVE;
    treeNode.list = node.next;
    return NODE_OPERATION.PRESERVE;
  }

  let prevNode: ListNode | undefined = node;
  node = node.next;

  while (node !== null) {
    if (node.index === index) {
      prevNode.next = node.next;
      return NODE_OPERATION.PRESERVE;
    }
    prevNode = node;
    node = node.next;
  }
}

const SENTINEL_NODE: TreeNode = {
  low: 0,
  max: 0,
  high: 0,
  color: NODE_COLOR.SENTINEL,
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

  while (x !== SENTINEL_NODE && x.color === NODE_COLOR.BLACK) {
    if (x === x.parent.left) {
      w = x.parent.right;

      if (w.color === NODE_COLOR.RED) {
        w.color = NODE_COLOR.BLACK;
        x.parent.color = NODE_COLOR.RED;
        rotateLeft(tree, x.parent);
        w = x.parent.right;
      }

      if (
        w.left.color === NODE_COLOR.BLACK &&
        w.right.color === NODE_COLOR.BLACK
      ) {
        w.color = NODE_COLOR.RED;
        x = x.parent;
      } else {
        if (w.right.color === NODE_COLOR.BLACK) {
          w.left.color = NODE_COLOR.BLACK;
          w.color = NODE_COLOR.RED;
          rotateRight(tree, w);
          w = x.parent.right;
        }

        w.color = x.parent.color;
        x.parent.color = NODE_COLOR.BLACK;
        w.right.color = NODE_COLOR.BLACK;
        rotateLeft(tree, x.parent);
        x = tree.root;
      }
    } else {
      w = x.parent.left;

      if (w.color === NODE_COLOR.RED) {
        w.color = NODE_COLOR.BLACK;
        x.parent.color = NODE_COLOR.RED;
        rotateRight(tree, x.parent);
        w = x.parent.left;
      }

      if (
        w.right.color === NODE_COLOR.BLACK &&
        w.left.color === NODE_COLOR.BLACK
      ) {
        w.color = NODE_COLOR.RED;
        x = x.parent;
      } else {
        if (w.left.color === NODE_COLOR.BLACK) {
          w.right.color = NODE_COLOR.BLACK;
          w.color = NODE_COLOR.RED;
          rotateLeft(tree, w);
          w = x.parent.left;
        }

        w.color = x.parent.color;
        x.parent.color = NODE_COLOR.BLACK;
        w.left.color = NODE_COLOR.BLACK;
        rotateRight(tree, x.parent);
        x = tree.root;
      }
    }
  }

  x.color = NODE_COLOR.BLACK;
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

  while (current.parent.color === NODE_COLOR.RED) {
    if (current.parent === current.parent.parent.left) {
      y = current.parent.parent.right;

      if (y.color === NODE_COLOR.RED) {
        current.parent.color = NODE_COLOR.BLACK;
        y.color = NODE_COLOR.BLACK;
        current.parent.parent.color = NODE_COLOR.RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.right) {
          current = current.parent;
          rotateLeft(tree, current);
        }

        current.parent.color = NODE_COLOR.BLACK;
        current.parent.parent.color = NODE_COLOR.RED;
        rotateRight(tree, current.parent.parent);
      }
    } else {
      y = current.parent.parent.left;

      if (y.color === NODE_COLOR.RED) {
        current.parent.color = NODE_COLOR.BLACK;
        y.color = NODE_COLOR.BLACK;
        current.parent.parent.color = NODE_COLOR.RED;
        current = current.parent.parent;
      } else {
        if (current === current.parent.left) {
          current = current.parent;
          rotateRight(tree, current);
        }

        current.parent.color = NODE_COLOR.BLACK;
        current.parent.parent.color = NODE_COLOR.RED;
        rotateLeft(tree, current.parent.parent);
      }
    }
  }
  tree.root.color = NODE_COLOR.BLACK;
}

interface IntervalTree {
  insert(low: number, high: number, index: number): void;
  remove(index: number): void;
  search(
    low: number,
    high: number,
    onCallback: (index: number, low: number) => void,
  ): void;
  size: number;
}

function createIntervalTree(): IntervalTree {
  const tree: Tree = {
    root: SENTINEL_NODE,
    size: 0,
  };

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
        color: NODE_COLOR.RED,
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
      if (intervalResult === NODE_OPERATION.PRESERVE) {
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

      if (originalYColor === NODE_COLOR.BLACK) fixRemove(tree, x);
      tree.size--;
    },

    search(low, high, onCallback) {
      const stack = [tree.root];
      while (stack.length !== 0) {
        const node = stack.pop();
        if (!node) continue;
        if (node === SENTINEL_NODE || low > node.max) continue;
        if (node.left !== SENTINEL_NODE) stack.push(node.left);
        if (node.right !== SENTINEL_NODE) stack.push(node.right);
        if (node.low <= high && node.high >= low) {
          let curr: ListNode | null = node.list;
          while (curr !== null) {
            if (curr.high >= low) onCallback(curr.index, node.low);
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

const COLUMN_WIDTH = 200;
const GAP = 0;
const ITEM_HEIGHT = 300;
const OVERSCAN = 2;
const SCROLL_FPS = 12;
const DEBOUNCE_DELAY = 300;

interface Positioner {
  columnCount: number;
  columnWidth: number;
  set: (index: number, height: number) => void;
  get: (index: number) => PositionerItem | undefined;
  update: (updates: number[]) => void;
  range: (
    low: number,
    high: number,
    onItemRender: (index: number, left: number, top: number) => void,
  ) => void;
  size: () => number;
  estimateHeight: (itemCount: number, defaultItemHeight: number) => number;
  shortestColumn: () => number;
  all: () => PositionerItem[];
}

interface PositionerItem {
  top: number;
  left: number;
  height: number;
  columnIndex: number;
}

interface UsePositionerOptions {
  width: number;
  columnWidth?: number;
  columnGap?: number;
  rowGap?: number;
  columnCount?: number;
  maxColumnCount?: number;
}

function usePositioner(
  {
    width,
    columnWidth = COLUMN_WIDTH,
    columnGap = GAP,
    rowGap,
    columnCount,
    maxColumnCount,
  }: UsePositionerOptions,
  deps: React.DependencyList = [],
): Positioner {
  const initPositioner = React.useCallback((): Positioner => {
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

    const computedColumnCount =
      columnCount ||
      Math.min(
        Math.floor((width + 8) / (columnWidth + 8)),
        maxColumnCount || Number.POSITIVE_INFINITY,
      ) ||
      1;
    const computedColumnWidth = Math.floor(
      (width - columnGap * (computedColumnCount - 1)) / computedColumnCount,
    );

    const intervalTree = createIntervalTree();
    const columnHeights: number[] = new Array(computedColumnCount).fill(0);
    const items: (PositionerItem | undefined)[] = [];
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
        let columnIndex = 0;

        for (let i = 1; i < columnHeights.length; i++) {
          const currentHeight = columnHeights[i];
          const shortestHeight = columnHeights[columnIndex];
          if (
            currentHeight !== undefined &&
            shortestHeight !== undefined &&
            currentHeight < shortestHeight
          ) {
            columnIndex = i;
          }
        }

        const columnHeight = columnHeights[columnIndex];
        if (columnHeight === undefined) return;

        const top = columnHeight;
        columnHeights[columnIndex] = top + height + (rowGap ?? columnGap);

        const columnItemsList = columnItems[columnIndex];
        if (!columnItemsList) return;
        columnItemsList.push(index);

        items[index] = {
          left: columnIndex * (computedColumnWidth + columnGap),
          top,
          height,
          columnIndex,
        };
        intervalTree.insert(top, top + height, index);
      },
      get: (index: number) => items[index],
      update: (updates: number[]) => {
        const columns: (number | undefined)[] = new Array(computedColumnCount);
        let i = 0;
        let j = 0;

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
          columns[item.columnIndex] =
            columns[item.columnIndex] === void 0
              ? currentIndex
              : Math.min(
                  currentIndex,
                  columns[item.columnIndex] ?? currentIndex,
                );
        }

        for (i = 0; i < columns.length; i++) {
          const currentColumn = columns[i];
          if (currentColumn === void 0) continue;

          const itemsInColumn = columnItems[i];
          if (!itemsInColumn) continue;

          const startIndex = binarySearch(itemsInColumn, currentColumn);
          if (startIndex === -1) continue;

          const currentItemIndex = itemsInColumn[startIndex];
          if (typeof currentItemIndex !== "number") continue;

          const startItem = items[currentItemIndex];
          if (!startItem) continue;

          const currentHeight = columnHeights[i];
          if (typeof currentHeight !== "number") continue;

          columnHeights[i] =
            startItem.top + startItem.height + (rowGap ?? columnGap);

          for (j = startIndex + 1; j < itemsInColumn.length; j++) {
            const currentIndex = itemsInColumn[j];
            if (typeof currentIndex !== "number") continue;

            const item = items[currentIndex];
            if (!item) continue;

            const columnHeight = columnHeights[i];
            if (typeof columnHeight !== "number") continue;

            item.top = columnHeight;
            columnHeights[i] = item.top + item.height + (rowGap ?? columnGap);
            intervalTree.remove(currentIndex);
            intervalTree.insert(item.top, item.top + item.height, currentIndex);
          }
        }
      },
      range: (low, high, onItemRender) =>
        intervalTree.search(low, high, (index: number, top: number) => {
          const item = items[index];
          if (!item) return;
          onItemRender(index, item.left, top);
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
        return columnHeights[0] ?? 0;
      },
      size(): number {
        return intervalTree.size;
      },
      all(): PositionerItem[] {
        return items.filter(Boolean) as PositionerItem[];
      },
    };
  }, [width, columnWidth, columnGap, rowGap, columnCount, maxColumnCount]);

  const positionerRef = React.useRef<Positioner | null>(null);
  if (positionerRef.current === null) positionerRef.current = initPositioner();

  const prevDepsRef = React.useRef(deps);
  const opts = [
    width,
    columnWidth,
    columnGap,
    rowGap,
    columnCount,
    maxColumnCount,
  ];
  const prevOptsRef = React.useRef(opts);
  const optsChanged = !opts.every((item, i) => prevOptsRef.current[i] === item);

  if (
    optsChanged ||
    !deps.every((item, i) => prevDepsRef.current[i] === item)
  ) {
    const prevPositioner = positionerRef.current;
    const positioner = initPositioner();
    prevDepsRef.current = deps;
    prevOptsRef.current = opts;

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

interface DebouncedWindowSizeOptions {
  containerRef: React.RefObject<RootElement | null>;
  defaultWidth?: number;
  defaultHeight?: number;
  delayMs?: number;
}

function useDebouncedWindowSize(options: DebouncedWindowSizeOptions) {
  const {
    containerRef,
    defaultWidth = 0,
    defaultHeight = 0,
    delayMs = DEBOUNCE_DELAY,
  } = options;

  const getDocumentSize = React.useCallback(() => {
    if (typeof document === "undefined") {
      return { width: defaultWidth, height: defaultHeight };
    }
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    };
  }, [defaultWidth, defaultHeight]);

  const [size, setSize] = React.useState(getDocumentSize());
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const setDebouncedSize = React.useCallback(
    (value: { width: number; height: number }) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setSize(value);
      }, delayMs);
    },
    [delayMs],
  );

  React.useEffect(() => {
    function onResize() {
      if (containerRef.current) {
        setDebouncedSize({
          width: containerRef.current.offsetWidth,
          height: document.documentElement.clientHeight,
        });
      } else {
        setDebouncedSize(getDocumentSize());
      }
    }

    window?.addEventListener("resize", onResize, { passive: true });
    window?.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window?.removeEventListener("resize", onResize);
      window?.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [setDebouncedSize, containerRef, getDocumentSize]);

  return { size, containerRef };
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
      const itemMap = new WeakMap<Element, number>();

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
          const index = itemMap.get(target);
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
          const index = itemMap.get(entry.target);

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
  fps = SCROLL_FPS,
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
  const prevCountRef = React.useRef(0);
  const trailingTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearTrailing = React.useCallback(() => {
    if (trailingTimeout.current) {
      clearTimeout(trailingTimeout.current);
    }
  }, []);

  React.useEffect(() => {
    return () => {
      prevCountRef.current = 0;
      clearTrailing();
    };
  }, [clearTrailing]);

  const throttledSetState = React.useCallback(
    (action: React.SetStateAction<State>) => {
      const perf = typeof performance !== "undefined" ? performance : Date;
      const now = () => perf.now();
      const rightNow = now();
      const call = () => {
        prevCountRef.current = rightNow;
        clearTrailing();
        latestSetState.current(action);
      };
      const current = prevCountRef.current;

      if (leading && current === 0) {
        return call();
      }

      if (rightNow - current > ms) {
        if (current > 0) {
          return call();
        }
        prevCountRef.current = rightNow;
      }

      clearTrailing();
      trailingTimeout.current = setTimeout(() => {
        call();
        prevCountRef.current = 0;
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
  [ITEM_NAME]: `\`${ITEM_NAME}\` must be within \`${VIEWPORT_NAME}\``,
} as const;

interface DivProps extends React.ComponentPropsWithoutRef<"div"> {}

type RootElement = React.ComponentRef<typeof MasonryRoot>;
type ItemElement = React.ComponentRef<typeof MasonryItem>;

interface MasonryContextValue {
  positioner: Positioner;
  resizeObserver?: ResizeObserver;
  columnWidth: number;
  onItemRegister: (index: number) => (node: ItemElement | null) => void;
  scrollTop: number;
  windowHeight: number;
  itemHeight: number;
  overscan: number;
  isScrolling?: boolean;
}

const MasonryContext = React.createContext<MasonryContextValue | null>(null);

function useMasonryContext(name: keyof typeof MASONRY_ERROR) {
  const context = React.useContext(MasonryContext);
  if (!context) {
    throw new Error(MASONRY_ERROR[name]);
  }
  return context;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface MasonryRootProps extends DivProps {
  columnWidth?: number;
  columnCount?: number;
  maxColumnCount?: number;
  gap?: number | { column: number; row: number };
  itemHeight?: number;
  defaultWidth?: number;
  defaultHeight?: number;
  overscan?: number;
  scrollFps?: number;
  asChild?: boolean;
}

const MasonryRoot = React.forwardRef<HTMLDivElement, MasonryRootProps>(
  (props, forwardedRef) => {
    const {
      columnWidth = COLUMN_WIDTH,
      columnCount,
      maxColumnCount,
      gap = GAP,
      itemHeight = ITEM_HEIGHT,
      defaultWidth,
      defaultHeight,
      overscan = OVERSCAN,
      scrollFps = SCROLL_FPS,
      asChild,
      children,
      style,
      ...rootProps
    } = props;

    const gapValue = typeof gap === "object" ? gap : { column: gap, row: gap };
    const columnGap = gapValue.column;
    const rowGap = gapValue.row;

    const containerRef = React.useRef<RootElement | null>(null);
    const composedRef = useComposedRefs(forwardedRef, containerRef);
    const { size, containerRef: windowSizeContainerRef } =
      useDebouncedWindowSize({
        containerRef,
        defaultWidth,
        defaultHeight,
        delayMs: DEBOUNCE_DELAY,
      });

    const [containerPosition, setContainerPosition] = React.useState<{
      offset: number;
      width: number;
    }>({ offset: 0, width: 0 });

    useIsomorphicLayoutEffect(() => {
      if (!containerRef.current) return;

      let offset = 0;
      let container = containerRef.current;
      windowSizeContainerRef.current = container;

      do {
        offset += container.offsetTop ?? 0;
        container = container.offsetParent as RootElement;
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
    }, [containerPosition, size]);

    const positioner = usePositioner({
      width: containerPosition.width ?? size.width,
      columnWidth,
      columnGap,
      rowGap,
      columnCount,
      maxColumnCount,
    });
    const resizeObserver = useResizeObserver(positioner);
    const { scrollTop, isScrolling } = useScroller({
      offset: containerPosition.offset,
      fps: scrollFps,
    });

    const itemMap = React.useRef(new WeakMap<ItemElement, number>()).current;

    const onItemRegister = React.useCallback(
      (index: number) => (node: ItemElement | null) => {
        if (!node) return;

        itemMap.set(node, index);
        if (resizeObserver) {
          resizeObserver.observe(node);
        }
        if (positioner.get(index) === void 0) {
          positioner.set(index, node.offsetHeight);
        }
      },
      [itemMap, positioner, resizeObserver],
    );

    const contextValue = React.useMemo<MasonryContextValue>(
      () => ({
        positioner,
        resizeObserver,
        columnWidth: positioner.columnWidth,
        onItemRegister,
        scrollTop,
        windowHeight: size.height,
        itemHeight,
        overscan,
        isScrolling,
      }),
      [
        positioner,
        resizeObserver,
        onItemRegister,
        scrollTop,
        size.height,
        itemHeight,
        overscan,
        isScrolling,
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
            ...style,
          }}
        >
          <MasonryViewport>{children}</MasonryViewport>
        </RootSlot>
      </MasonryContext.Provider>
    );
  },
);

MasonryRoot.displayName = ROOT_NAME;

interface MasonryItemPropsWithRef extends MasonryItemProps {
  ref: React.Ref<ItemElement>;
}

const MasonryViewport = React.forwardRef<HTMLDivElement, DivProps>(
  (props, forwardedRef) => {
    const { children, style, ...viewportProps } = props;
    const context = useMasonryContext(VIEWPORT_NAME);

    const itemCount = React.useMemo(() => {
      return React.Children.toArray(children).filter(
        (child): child is React.ReactElement<MasonryItemPropsWithRef> =>
          React.isValidElement(child) &&
          (child.type === MasonryItem || child.type === Item),
      ).length;
    }, [children]);

    const estimatedHeight = React.useMemo(
      () => context.positioner.estimateHeight(itemCount, context.itemHeight),
      [context.positioner, itemCount, context.itemHeight],
    );

    const [startIndex, stopIndex] = React.useMemo(() => {
      const overscanPixels = context.windowHeight * context.overscan;
      const rangeStart = Math.max(0, context.scrollTop - overscanPixels);
      const rangeEnd =
        context.scrollTop + context.windowHeight + overscanPixels;

      const visibleItems: number[] = [];
      context.positioner.range(rangeStart, rangeEnd, (index) => {
        visibleItems.push(index);
      });

      if (!visibleItems.length) {
        return [0, Math.min(100, itemCount - 1)];
      }

      const minVisible = Math.min(...visibleItems);
      const maxVisible = Math.max(...visibleItems);
      const overscanCount = Math.ceil(context.overscan * 2);

      return [
        Math.max(0, minVisible - overscanCount),
        Math.min(itemCount - 1, maxVisible + overscanCount),
      ];
    }, [
      context.scrollTop,
      context.windowHeight,
      context.overscan,
      context.positioner,
      itemCount,
    ]);

    const positionedChildren = React.useMemo(() => {
      const validChildren = React.Children.toArray(children).filter(
        (child): child is React.ReactElement<MasonryItemPropsWithRef> =>
          React.isValidElement(child) &&
          (child.type === MasonryItem || child.type === Item),
      );

      return validChildren
        .map((child, index) => {
          const position = context.positioner.get(index);
          const isInView = index >= startIndex && index <= stopIndex;
          const shouldRender = isInView || !position || context.isScrolling;
          if (!shouldRender) return null;

          return React.cloneElement(child, {
            key: child.key ?? index,
            ref: context.onItemRegister(index),
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
      context.onItemRegister,
    ]);

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

    return (
      <div {...viewportProps} ref={forwardedRef} style={composedStyle}>
        {positionedChildren}
      </div>
    );
  },
);

MasonryViewport.displayName = VIEWPORT_NAME;

interface MasonryItemProps extends DivProps {
  asChild?: boolean;
}

const MasonryItem = React.forwardRef<HTMLDivElement, MasonryItemProps>(
  (props, forwardedRef) => {
    const { asChild, ...itemProps } = props;

    const ItemSlot = asChild ? Slot : "div";

    return <ItemSlot {...itemProps} ref={forwardedRef} />;
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
