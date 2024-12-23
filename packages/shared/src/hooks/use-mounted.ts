import * as React from "react";
import { useLayoutEffect } from "./use-layout-effect";

export function useMounted() {
  const [mounted, setMounted] = React.useState(false);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
