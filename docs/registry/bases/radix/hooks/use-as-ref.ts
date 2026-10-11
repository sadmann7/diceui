import { useLayoutEffect } from "radix-ui/internal";
import * as React from "react";

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

export { useAsRef };
