import * as React from "react";
import type { CollectionItem } from "./use-collection";
import { useFilter } from "./use-filter";

interface FilterStore {
  search: string;
  itemCount: number;
  items: Map<string, number>;
  groups?: Map<string, Set<string>>;
}

interface UseFilterStoreOptions<TElement extends HTMLElement, TData = {}> {
  itemMap: Map<
    React.RefObject<TElement | null>,
    CollectionItem<TElement, TData>
  >;
  groupMap?: Map<string, Set<React.RefObject<TElement | null>>> | null;
  onFilter?: (options: string[], term: string) => string[];
  exactMatch?: boolean;
  manualFiltering?: boolean;
}

function useFilterStore<
  TElement extends HTMLElement,
  TData extends { id: string; value: string },
>({
  itemMap,
  groupMap,
  onFilter,
  exactMatch,
  manualFiltering,
}: UseFilterStoreOptions<TElement, TData>) {
  const filterStore = React.useRef<FilterStore>({
    search: "",
    itemCount: 0,
    items: new Map<string, number>(),
    groups: groupMap ? new Map<string, Set<string>>() : undefined,
  }).current;

  const filter = useFilter({ sensitivity: "base", gapMatch: true });
  const currentFilter = React.useMemo(
    () => (exactMatch ? filter.contains : filter.fuzzy),
    [filter.fuzzy, filter.contains, exactMatch],
  );

  const getItemScore = React.useCallback(
    (value: string, searchTerm: string) => {
      if (!searchTerm) return 1;
      if (!value) return 0;

      if (searchTerm === "") return 1;
      if (value === searchTerm) return 2;
      if (value.startsWith(searchTerm)) return 1.5;

      return onFilter
        ? Number(onFilter([value], searchTerm).length > 0)
        : Number(currentFilter(value, searchTerm));
    },
    [currentFilter, onFilter],
  );

  const onItemsFilter = React.useCallback(() => {
    if (!filterStore.search || manualFiltering) {
      filterStore.itemCount = itemMap.size;
      return;
    }

    filterStore.items.clear();
    if (groupMap && filterStore.groups) {
      filterStore.groups.clear();
    }

    const searchTerm = filterStore.search;
    let itemCount = 0;
    let pendingBatch: [React.RefObject<TElement | null>, TData][] = [];
    const BATCH_SIZE = 250;

    function processBatch() {
      if (!pendingBatch.length) return;

      const scores = new Map<string, number>();

      for (const [_, itemData] of pendingBatch) {
        const score = getItemScore(itemData.value, searchTerm);
        if (score > 0) {
          scores.set(itemData.id, score);
          itemCount++;
        }
      }

      // Sort by score in descending order and add to filterStore
      const sortedScores = Array.from(scores.entries()).sort(
        ([, a], [, b]) => b - a,
      );

      for (const [id, score] of sortedScores) {
        filterStore.items.set(id, score);
      }

      pendingBatch = [];
    }

    // Process items in batches
    for (const [id, value] of itemMap) {
      pendingBatch.push([id, value]);

      if (pendingBatch.length >= BATCH_SIZE) {
        processBatch();
      }
    }

    // Process remaining items
    if (pendingBatch.length > 0) {
      processBatch();
    }

    filterStore.itemCount = itemCount;

    // Update groups if needed
    if (!groupMap || !filterStore.groups) return;

    if (groupMap.size && itemCount > 0) {
      const matchingItems = new Set(filterStore.items.keys());

      for (const [groupId, group] of groupMap) {
        const hasMatchingItem = Array.from(group).some((ref) =>
          matchingItems.has(ref.current?.id ?? ""),
        );

        if (hasMatchingItem) {
          filterStore.groups.set(groupId, new Set());
        }
      }
    }
  }, [manualFiltering, filterStore, itemMap, groupMap, getItemScore]);

  const getIsItemVisible = React.useCallback(
    (id: string) => {
      if (manualFiltering) return true;
      if (!filterStore.search) return true;
      return (filterStore.items.get(id) ?? 0) > 0;
    },
    [filterStore, manualFiltering],
  );

  return {
    filterStore,
    onItemsFilter,
    getIsItemVisible,
  };
}

export { useFilterStore };

export type { FilterStore };
