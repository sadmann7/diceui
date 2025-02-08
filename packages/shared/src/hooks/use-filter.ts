import * as React from "react";

class LRUCache<K, V> {
  private cache: Map<K, V>;
  private readonly maxSize: number;
  private readonly keyOrder: K[];

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.keyOrder = [];
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to most recently used
      const index = this.keyOrder.indexOf(key);
      if (index > -1) {
        this.keyOrder.splice(index, 1);
        this.keyOrder.push(key);
      }
    }
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing key
      this.cache.set(key, value);
      const index = this.keyOrder.indexOf(key);
      if (index > -1) {
        this.keyOrder.splice(index, 1);
      }
    } else {
      // Add new key
      if (this.keyOrder.length >= this.maxSize) {
        const lruKey = this.keyOrder.shift();
        if (lruKey !== undefined) {
          this.cache.delete(lruKey);
        }
      }
      this.cache.set(key, value);
    }
    this.keyOrder.push(key);
  }

  clear(): void {
    this.cache.clear();
    this.keyOrder.length = 0;
  }

  get size(): number {
    return this.cache.size;
  }
}

// Cache sizes tuned for typical usage patterns
const collatorCache = new LRUCache<string, Intl.Collator>(10); // Few collator options typically used
const normalizedCache = new LRUCache<string, string>(1000); // More strings to normalize

const SEPARATORS_PATTERN = /[-_\s./\\|:;,]+/g;
const UNWANTED_CHARS = /[^\p{L}\p{N}\s]/gu;

function normalizeWithGaps(str: string) {
  if (!str) return "";
  if (typeof str !== "string") return "";

  const cached = normalizedCache.get(str);
  if (cached !== undefined) return cached;

  let normalized: string;
  try {
    normalized = str
      .toLowerCase()
      .normalize("NFC")
      .replace(UNWANTED_CHARS, " ")
      .replace(SEPARATORS_PATTERN, " ")
      .trim()
      .replace(/\s+/g, "");
  } catch (_err) {
    normalized = str
      .toLowerCase()
      .normalize("NFC")
      .replace(/[^a-z0-9\s]/g, " ")
      .trim()
      .replace(/\s+/g, "");
  }

  // If the string only contained special characters, it will be empty after normalization
  // Return a special value that won't match anything
  if (normalized === "" && str.length > 0) {
    normalized = "\u0000"; // Using null character as a special non-matching value
  }

  // Cache the normalized string
  normalizedCache.set(str, normalized);
  return normalized;
}

interface UseFilterOptions extends Intl.CollatorOptions {
  /**
   * Whether to match strings with gaps between words.
   * @default false
   */
  gapMatch?: boolean;

  /**
   * The sensitivity of the collator.
   * @default "base"
   */
  sensitivity?: Intl.CollatorOptions["sensitivity"];
}

function useFilter(options?: UseFilterOptions) {
  const cacheKey = options
    ? Object.entries(options)
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .join()
    : "";

  let collator = collatorCache.get(cacheKey);
  if (!collator) {
    collator = new Intl.Collator("en", {
      ...options,
      sensitivity: "base",
    });
    collatorCache.set(cacheKey, collator);
  }

  const startsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.startsWith(normalizedSubstring);
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
    [collator, options?.gapMatch],
  );

  const endsWith = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.endsWith(normalizedSubstring);
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
    [collator, options?.gapMatch],
  );

  const contains = React.useCallback(
    (string: string, substring: string) => {
      if (substring.length === 0) {
        return true;
      }

      if (options?.gapMatch) {
        const normalizedString = normalizeWithGaps(string);
        const normalizedSubstring = normalizeWithGaps(substring);
        return normalizedString.includes(normalizedSubstring);
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
    [collator, options?.gapMatch],
  );

  const fuzzy = React.useCallback(
    (string: string, pattern: string) => {
      if (pattern.length === 0) return true;
      if (string.length === 0) return false;

      if (options?.gapMatch) {
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

      const normalizedString = string.normalize("NFC");
      const normalizedPattern = pattern.normalize("NFC");

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

  return React.useMemo(
    () => ({
      startsWith,
      endsWith,
      contains,
      fuzzy,
    }),
    [startsWith, endsWith, contains, fuzzy],
  );
}

export { useFilter };
