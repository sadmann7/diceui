/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/compose-refs/src/composeRefs.tsx
 */

import * as React from "react";

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T) {
  if (typeof ref === "function") {
    return ref(value);
  }

  if (ref !== null && ref !== undefined) {
    ref.current = value;
  }
}

/** Composes callback refs and ref objects into one callback ref. */
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

/** A memoized `composeRefs`. */
function useComposedRefs<T>(...refs: PossibleRef<T>[]): React.RefCallback<T> {
  // oxlint-disable-next-line react/exhaustive-deps -- memoized by every ref
  return React.useCallback(composeRefs(...refs), refs);
}

export { composeRefs, useComposedRefs };
