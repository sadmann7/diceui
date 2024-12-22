import * as React from "react";
import { useCallbackRef } from "./use-callback-ref";

function wrapArray<T>(array: T[], startIndex: number) {
  return array.map((_, index) => array[(startIndex + index) % array.length]);
}

function findNextItem<T extends { textValue: string }>(
  items: T[],
  search: string,
  currentItem?: T,
) {
  if (!search) return undefined;

  const isRepeated =
    search.length > 1 && Array.from(search).every((char) => char === search[0]);
  const normalizedSearch = isRepeated ? (search[0] ?? "") : search;
  const currentItemIndex = currentItem ? items.indexOf(currentItem) : -1;
  let wrappedItems = wrapArray(items, Math.max(currentItemIndex, 0));
  const excludeCurrentItem = normalizedSearch.length === 1;

  if (excludeCurrentItem) {
    wrappedItems = wrappedItems.filter((v) => v !== currentItem);
  }

  const nextItem = wrappedItems.find((item) => {
    if (!item?.textValue) return false;
    return item.textValue
      .toLowerCase()
      .startsWith(normalizedSearch.toLowerCase());
  });

  return nextItem !== currentItem ? nextItem : undefined;
}

interface UseTypeaheadProps {
  onSearchChange: (search: string) => void;
  enabled?: boolean;
  immediate?: boolean;
}

function useTypeahead({
  onSearchChange,
  enabled = true,
  immediate = false,
}: UseTypeaheadProps) {
  const onSearchChangeCallback = useCallbackRef(onSearchChange);
  const searchRef = React.useRef("");
  const timerRef = React.useRef(0);

  const onTypeaheadSearch = React.useCallback(
    (key: string) => {
      if (!enabled) return;

      const search = searchRef.current + key;
      if (immediate) {
        onSearchChangeCallback(search);
      }

      (function updateSearch(value: string) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") {
          timerRef.current = window.setTimeout(() => {
            if (!immediate) {
              onSearchChangeCallback("");
            }
            updateSearch("");
          }, 1000);
        }
      })(search);
    },
    [onSearchChangeCallback, enabled, immediate],
  );

  const onResetTypeahead = React.useCallback(() => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  return {
    searchRef,
    onTypeaheadSearch,
    onResetTypeahead,
    getCurrentSearch: () => searchRef.current,
  } as const;
}

export { findNextItem, useTypeahead, wrapArray };
