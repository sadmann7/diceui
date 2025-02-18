export type AreEqual<Args> = (currentArgs: Args, prevArgs: Args) => boolean;
export type InputFunction = (...args: unknown[]) => unknown;
export type OutputFunction<Args extends unknown[], T> = (...args: Args) => T;

const defaultAreEqual = <T extends unknown[]>(current: T, prev: T): boolean =>
  current[0] === prev[0] &&
  current[1] === prev[1] &&
  current[2] === prev[2] &&
  current[3] === prev[3];

const memoizeOne = <Args extends unknown[], T>(
  fn: (...args: Args) => T,
  areEqual?: AreEqual<Args>,
): OutputFunction<Args, T> => {
  const equal = areEqual || defaultAreEqual;
  let lastArgs: Args | undefined;
  let value: T;

  return (...currentArgs: Args): T => {
    if (lastArgs && equal(currentArgs, lastArgs)) {
      return value;
    }
    lastArgs = currentArgs;
    value = fn(...currentArgs);
    return value;
  };
};

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
    // @ts-ignore
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

class OneKeyMap<K = unknown, V = unknown> {
  set: (k: K, v: V) => void;
  get: (k: K) => V | undefined;

  constructor() {
    let key: K | undefined;
    let val: V | undefined;
    this.get = (k: K): V | undefined => (k === key ? val : void 0);
    this.set = (k: K, v: V): void => {
      key = k;
      val = v;
    };
  }
}

export { defaultAreEqual, memoizeOne, trieMemoize, OneKeyMap };
