"use client";

import * as React from "react";

import { useLazyRef } from "@/hooks/use-lazy-ref";

interface Store<T> {
  subscribe: (callback: () => void) => () => void;
  getState: () => T;
  setState: <K extends keyof T>(key: K, value: T[K]) => void;
  notify: () => void;
}

function createStore<T>(
  listenersRef: React.RefObject<Set<() => void>>,
  stateRef: React.RefObject<T>,
  onValueChange?: Partial<{
    [K in keyof T]: (value: T[K], store: Store<T>) => void;
  }>,
): Store<T> {
  const store: Store<T> = {
    subscribe: (cb) => {
      listenersRef.current.add(cb);
      return () => listenersRef.current.delete(cb);
    },
    getState: () => stateRef.current,
    setState: (key, value) => {
      if (Object.is(stateRef.current[key], value)) return;
      stateRef.current[key] = value;
      onValueChange?.[key]?.(value, store);
      store.notify();
    },
    notify: () => {
      for (const cb of listenersRef.current) {
        cb();
      }
    },
  };

  return store;
}

function useStoreSelector<T, U>(store: Store<T>, selector: (state: T) => U): U {
  const getSnapshot = React.useCallback(
    () => selector(store.getState()),
    [store, selector],
  );

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

function useStore<T>(initialState: T) {
  const stateRef = useLazyRef(() => initialState);
  const listenersRef = useLazyRef(() => new Set<() => void>());

  const store = React.useMemo(
    () => createStore(listenersRef, stateRef),
    [listenersRef, stateRef],
  );

  return store;
}

export { useStore, useStoreSelector, type Store };
