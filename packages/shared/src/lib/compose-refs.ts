/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/composeRefs.tsx
 */

import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

/**
 * Set a given ref to a given value.
 * This utility takes care of different types of refs: callback refs and RefObject(s).
 */
function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/**
 * A utility to compose multiple refs together.
 * Accepts callback refs and RefObject(s).
 */
function composeRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  return (node) => {
    let hasCleanup = false;
    const cleanups = refs.map((ref) => {
      const cleanup = setRef(ref, node);
      if (!hasCleanup && typeof cleanup === "function") {
        hasCleanup = true;
      }
      return cleanup;
    });

    // React <19 logs an error when a callback ref returns a value, which only
    // happens when a user's ref callback returns a React 19 cleanup.
    if (hasCleanup) {
      return () => {
        for (let i = 0; i < cleanups.length; i++) {
          const cleanup = cleanups[i];
          if (typeof cleanup === "function") {
            cleanup();
          } else {
            setRef(refs[i], null);
          }
        }
      };
    }
  };
}

/**
 * A custom hook that composes multiple refs.
 * Accepts callback refs and RefObject(s).
 */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // oxlint-disable-next-line react/exhaustive-deps -- we want to memoize by all values
  return React.useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
