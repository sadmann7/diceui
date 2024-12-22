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

function useTypeahead(onSearchChange: (search: string) => void) {
  const onSearchChangeCallback = useCallbackRef(onSearchChange);
  const searchRef = React.useRef("");
  const timerRef = React.useRef(0);

  const onTypeaheadSearch = React.useCallback(
    (key: string) => {
      const search = searchRef.current + key;
      onSearchChangeCallback(search);

      (function updateSearch(value: string) {
        searchRef.current = value;
        window.clearTimeout(timerRef.current);
        if (value !== "") {
          timerRef.current = window.setTimeout(() => updateSearch(""), 1000);
        }
      })(search);
    },
    [onSearchChangeCallback],
  );

  const resetTypeahead = React.useCallback(() => {
    searchRef.current = "";
    window.clearTimeout(timerRef.current);
  }, []);

  React.useEffect(() => {
    return () => window.clearTimeout(timerRef.current);
  }, []);

  return {
    searchRef,
    onTypeaheadSearch,
    resetTypeahead,
    getCurrentSearch: () => searchRef.current,
  } as const;
}

export { useTypeahead, findNextItem, wrapArray };
