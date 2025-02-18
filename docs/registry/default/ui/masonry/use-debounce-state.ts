import * as React from "react";

interface DebounceOptions {
  wait?: number;
  leading?: boolean;
}

export function useDebounceState<T>(
  initialState: T | (() => T),
  options: DebounceOptions = {},
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const { wait = 100, leading = false } = options;
  const [state, setState] = React.useState<T>(initialState);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const leadingRef = React.useRef(true);

  const debouncedSetState = React.useCallback(
    (value: T | ((prevState: T) => T)) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      if (leading && leadingRef.current) {
        leadingRef.current = false;
        setState(value);
        timeoutRef.current = setTimeout(() => {
          leadingRef.current = true;
        }, wait);
        return;
      }

      timeoutRef.current = setTimeout(() => {
        leadingRef.current = true;
        setState(value);
      }, wait);
    },
    [wait, leading],
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [state, debouncedSetState];
}
