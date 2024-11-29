/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/id/src/id.tsx
 */

import * as React from "react";
import { useLayoutEffect } from "./use-layout-effect";

// We spaces with `.trim().toString()` to prevent bundlers from trying to `import { useId } from 'react';`
const useReactId =
  (React as { [key: string]: unknown })[" useId ".trim().toString()] ||
  (() => undefined);
let count = 0;

function useId(deterministicId?: string): string {
  const [id, setId] = React.useState<string | undefined>(
    typeof useReactId === "function" ? useReactId() : undefined,
  );
  // React versions older than 18 will have client-side ids only.
  useLayoutEffect(() => {
    if (!deterministicId) setId((reactId) => reactId ?? String(count++));
  }, [deterministicId]);
  return deterministicId || (id ? `dice-${id}` : "");
}

export { useId };
