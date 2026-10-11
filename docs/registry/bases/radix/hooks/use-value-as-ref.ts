import { useLayoutEffect } from "radix-ui/internal";
import * as React from "react";

function useValueAsRef<T>(value: T) {
  const ref = React.useRef<T>(value);

  useLayoutEffect(() => {
    ref.current = value;
  });

  return ref;
}

export { useValueAsRef };
