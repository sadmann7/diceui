import * as React from "react";

const collatorCache = new Map<string, Intl.Collator>();
const normalizedCache = new Map<string, string>();

interface UseFilterOptions extends Intl.CollatorOptions {
  gapMatch?: boolean;
}

const SEPARATORS_PATTERN = /[-_\s./\\|:;,]+/g;
const UNWANTED_CHARS = /[^\p{L}\p{N}\s]/gu;

function normalizeWithGaps(str: string) {
  if (!str) return "";
  if (typeof str !== "string") return "";

  const cached = normalizedCache.get(str);
  if (cached !== undefined) return cached;

  let normalized: string;
  try {
    // Combine operations to reduce string iterations
    normalized = str
      .toLowerCase()
      .normalize("NFC")
      .replace(UNWANTED_CHARS, " ")
      .replace(SEPARATORS_PATTERN, " ")
      .trim()
      .replace(/\s+/g, ""); // Remove all spaces for gap matching
  } catch (_err) {
    // Fallback for environments without Unicode property support
    normalized = str
      .toLowerCase()
      .normalize("NFC")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim()
      .replace(/\s+/g, "");
  }

  // Only cache if the normalized string is different from lowercase input
  if (normalized !== str.toLowerCase()) {
    normalizedCache.set(str, normalized);
  }

  return normalized;
}

// Limit cache size to prevent memory leaks
function clearCacheIfNeeded() {
  if (normalizedCache.size > 10000) {
    normalizedCache.clear();
  }
}

export function useFilter(options?: UseFilterOptions) {
  const cacheKey = options
    ? Object.entries(options)
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .join()
    : "";

  let collator = collatorCache.get(cacheKey);
  if (!collator) {
    collator = new Intl.Collator("en", {
      ...options,
      sensitivity: "base", // Make collator ignore case and diacritics by default
    });
    collatorCache.set(cacheKey, collator);
  }

  const startsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        clearCacheIfNeeded();
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.startsWith(normalizedSubstring);
      }

      const normalizedString = string.toLowerCase().normalize("NFC");
      const normalizedSubstring = substring.toLowerCase().normalize("NFC");
      return (
        collator.compare(
          normalizedString.slice(0, normalizedSubstring.length),
          normalizedSubstring,
        ) === 0
      );
    },
    [collator, options?.gapMatch],
  );

  const endsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        clearCacheIfNeeded();
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.endsWith(normalizedSubstring);
      }

      const normalizedString = string.toLowerCase().normalize("NFC");
      const normalizedSubstring = substring.toLowerCase().normalize("NFC");
      return (
        collator.compare(
          normalizedString.slice(-normalizedSubstring.length),
          normalizedSubstring,
        ) === 0
      );
    },
    [collator, options?.gapMatch],
  );

  const contains = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        clearCacheIfNeeded();
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.includes(normalizedSubstring);
      }

      const normalizedString = string.toLowerCase().normalize("NFC");
      const normalizedSubstring = substring.toLowerCase().normalize("NFC");

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
    [collator, options?.gapMatch],
  );

  const fuzzy = React.useCallback(
    (string: string, pattern: string) => {
      if (pattern.length === 0) return true;
      if (string.length === 0) return false;

      if (options?.gapMatch) {
        clearCacheIfNeeded();
        const normalizedString = normalizeWithGaps(string);
        const normalizedPattern = normalizeWithGaps(pattern);

        let patternIdx = 0;
        let stringIdx = 0;

        while (
          stringIdx < normalizedString.length &&
          patternIdx < normalizedPattern.length
        ) {
          if (normalizedString[stringIdx] === normalizedPattern[patternIdx]) {
            patternIdx++;
          }
          stringIdx++;
        }

        return patternIdx === normalizedPattern.length;
      }

      const normalizedString = string.toLowerCase().normalize("NFC");
      const normalizedPattern = pattern.toLowerCase().normalize("NFC");

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
    [collator, options?.gapMatch],
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
