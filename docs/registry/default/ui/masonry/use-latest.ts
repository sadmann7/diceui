import * as React from "react";

export function useLatest<Value>(value: Value): React.RefObject<Value> {
  const ref = React.useRef<Value>(value);
  ref.current = value;
  return ref;
}
