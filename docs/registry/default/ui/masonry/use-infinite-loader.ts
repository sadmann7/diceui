import * as React from "react";
import { useLatest } from "./use-latest";

export function useInfiniteLoader<Item, T extends LoadMoreItemsCallback<Item>>(
  loadMoreItems: T,
  options: UseInfiniteLoaderOptions<Item> = emptyObj,
): LoadMoreItemsCallback<Item> {
  const {
    isItemLoaded,
    minimumBatchSize = 16,
    threshold = 16,
    totalItems = 9e9,
  } = options;
  const storedLoadMoreItems = useLatest(loadMoreItems);
  const storedIsItemLoaded = useLatest(isItemLoaded);

  return React.useCallback(
    (startIndex, stopIndex, items) => {
      const unloadedRanges = scanForUnloadedRanges(
        items,
        Math.max(0, startIndex - threshold),
        Math.min(totalItems - 1, (stopIndex || 0) + threshold),
        storedIsItemLoaded.current,
        minimumBatchSize,
        totalItems,
      );
      // The user is responsible for memoizing their loadMoreItems() function
      // because we don't want to make assumptions about how they want to deal
      // with `items`
      for (let i = 0; i < unloadedRanges.length - 1; ++i)
        storedLoadMoreItems.current(
          unloadedRanges[i] ?? 0,
          unloadedRanges[++i] ?? 0,
          items,
        );
    },
    [
      totalItems,
      minimumBatchSize,
      threshold,
      storedLoadMoreItems,
      storedIsItemLoaded,
    ],
  );
}

function scanForUnloadedRanges<Item>(
  items: Item[],
  startIndex: number,
  stopIndex: number,
  isItemLoaded: UseInfiniteLoaderOptions<Item>["isItemLoaded"] = defaultIsItemLoaded,
  minimumBatchSize: UseInfiniteLoaderOptions<Item>["minimumBatchSize"] = 16,
  totalItems: UseInfiniteLoaderOptions<Item>["totalItems"] = 9e9,
): number[] {
  const unloadedRanges: number[] = [];
  let rangeStartIndex: number | undefined;
  let rangeStopIndex: number | undefined;
  let index = startIndex;

  /* istanbul ignore next */
  for (; index <= stopIndex; index++) {
    if (!isItemLoaded(index, items)) {
      rangeStopIndex = index;
      if (rangeStartIndex === void 0) rangeStartIndex = index;
    } else if (rangeStartIndex !== void 0 && rangeStopIndex !== void 0) {
      unloadedRanges.push(rangeStartIndex, rangeStopIndex);
      rangeStartIndex = rangeStopIndex = void 0;
    }
  }

  // If :rangeStopIndex is not null it means we haven't run out of unloaded rows.
  // Scan forward to try filling our :minimumBatchSize.
  if (rangeStartIndex !== void 0 && rangeStopIndex !== void 0) {
    const potentialStopIndex = Math.min(
      Math.max(rangeStopIndex, rangeStartIndex + minimumBatchSize - 1),
      totalItems - 1,
    );

    /* istanbul ignore next */
    for (index = rangeStopIndex + 1; index <= potentialStopIndex; index++) {
      if (!isItemLoaded(index, items)) {
        rangeStopIndex = index;
      } else {
        break;
      }
    }

    unloadedRanges.push(rangeStartIndex, rangeStopIndex);
  }

  // Check to see if our first range ended prematurely.
  // In this case we should scan backwards to try filling our :minimumBatchSize.
  /* istanbul ignore next */
  if (unloadedRanges.length >= 2) {
    const firstUnloadedStart = unloadedRanges[0];
    const firstUnloadedStop = unloadedRanges[1];

    if (
      typeof firstUnloadedStart === "number" &&
      typeof firstUnloadedStop === "number"
    ) {
      let currentStart: number = firstUnloadedStart;

      while (
        firstUnloadedStop - currentStart + 1 < minimumBatchSize &&
        currentStart > 0
      ) {
        const checkIndex = currentStart - 1;

        if (!isItemLoaded(checkIndex, items)) {
          unloadedRanges[0] = currentStart = checkIndex;
        } else {
          break;
        }
      }
    }
  }

  return unloadedRanges;
}

function defaultIsItemLoaded<Item>(index: number, items: Item[]): boolean {
  return items[index] !== void 0;
}

export interface UseInfiniteLoaderOptions<Item> {
  isItemLoaded?: (index: number, items: Item[]) => boolean;
  minimumBatchSize?: number;
  threshold?: number;
  totalItems?: number;
}

export type LoadMoreItemsCallback<Item> = (
  startIndex: number,
  stopIndex: number,
  items: Item[],
) => Promise<void> | void;

const emptyObj = {} as const;
