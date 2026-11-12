/**
 * @see https://github.com/radix-ui/primitives/blob/main/packages/react/use-layout-effect/src/useLayoutEffect.tsx
 */

import * as React from "react";

/** `useLayoutEffect` on the client and a no-op on the server, where React warns about it. */
const useLayoutEffect = globalThis?.document ? React.useLayoutEffect : () => {};

export { useLayoutEffect };
