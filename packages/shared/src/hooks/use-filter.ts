import * as React from "react";

const collatorCache = new Map<string, Intl.Collator>();

export interface Filter {
  startsWith(string: string, substring: string): boolean;
  endsWith(string: string, substring: string): boolean;
  contains(string: string, substring: string): boolean;
  fuzzy(string: string, substring: string): boolean;
}

export function useFilter(options?: Intl.CollatorOptions): Filter {
  const cacheKey = options
    ? Object.entries(options)
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .join()
    : "";

  let collator = collatorCache.get(cacheKey);
  if (!collator) {
    collator = new Intl.Collator("en", options);
    collatorCache.set(cacheKey, collator);
  }

  const startsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      const normalizedString = string.normalize("NFC");
      const normalizedSubstring = substring.normalize("NFC");
      return (
        collator.compare(
          normalizedString.slice(0, normalizedSubstring.length),
          normalizedSubstring,
        ) === 0
      );
    },
    [collator],
  );

  const endsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      const normalizedString = string.normalize("NFC");
      const normalizedSubstring = substring.normalize("NFC");

      return (
        collator.compare(
          normalizedString.slice(-normalizedSubstring.length),
          normalizedSubstring,
        ) === 0
      );
    },
    [collator],
  );

  const contains = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      const normalizedString = string.normalize("NFC");
      const normalizedSubstring = substring.normalize("NFC");

      let scan = 0;
      const sliceLen = normalizedSubstring.length;
      for (; scan + sliceLen <= normalizedString.length; scan++) {
        const slice = normalizedString.slice(scan, scan + sliceLen);
        if (collator.compare(normalizedSubstring, slice) === 0) {
          return true;
        }
      }

      return false;
    },
    [collator],
  );

  const fuzzy = React.useCallback(
    (string: string, pattern: string) => {
      if (pattern.length === 0) return true;
      if (string.length === 0) return false;

      const normalizedString = string.normalize("NFC").toLowerCase();
      const normalizedPattern = pattern.normalize("NFC").toLowerCase();

      let patternIdx = 0;
      let stringIdx = 0;

      while (
        stringIdx < normalizedString.length &&
        patternIdx < normalizedPattern.length
      ) {
        if (
          collator.compare(
            normalizedString[stringIdx] ?? "",
            normalizedPattern[patternIdx] ?? "",
          ) === 0
        ) {
          patternIdx++;
        }
        stringIdx++;
      }

      return patternIdx === normalizedPattern.length;
    },
    [collator],
  );

  const memoizedFilter = React.useMemo(
    () => ({
      startsWith,
      endsWith,
      contains,
      fuzzy,
    }),
    [startsWith, endsWith, contains, fuzzy],
  );

  return memoizedFilter;
}
