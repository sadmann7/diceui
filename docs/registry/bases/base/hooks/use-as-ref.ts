import { useIsoLayoutEffect } from "@base-ui/utils/useIsoLayoutEffect";
import * as React from "react";

function useAsRef<T>(props: T) {
  const ref = React.useRef<T>(props);

  useIsoLayoutEffect(() => {
    ref.current = props;
  });

  return ref;
}

export { useAsRef };
