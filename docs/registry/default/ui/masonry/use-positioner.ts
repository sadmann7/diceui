import * as React from "react";
import { createIntervalTree } from "./interval-tree";

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
  deps: React.DependencyList = emptyArr
): Positioner {
  const initPositioner = (): Positioner => {
    const [computedColumnWidth, computedColumnCount] = getColumns(
      width,
      columnWidth,
      columnGutter,
      columnCount,
      maxColumnCount
    );
    return createPositioner(
      computedColumnCount,
      computedColumnWidth,
      columnGutter,
      rowGutter ?? columnGutter
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
        "usePositioner(): The length of your dependencies array changed."
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
  rowGutter = columnGutter
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
      renderCallback: (index: number, left: number, top: number) => void
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
    renderCallback: (index: number, left: number, top: number) => void
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
  maxColumnCount?: number
): [number, number] => {
  const computedColumnCount =
    initialColumnCount ||
    Math.min(
      Math.floor((width + gutter) / (minimumWidth + gutter)),
      maxColumnCount || Number.POSITIVE_INFINITY
    ) ||
    1;
  const columnWidth = Math.floor(
    (width - gutter * (computedColumnCount - 1)) / computedColumnCount
  );
  return [columnWidth, computedColumnCount];
};

const emptyArr: [] = [];
