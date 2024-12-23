import * as React from "react";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

export function useMounted() {
  const [mounted, setMounted] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
