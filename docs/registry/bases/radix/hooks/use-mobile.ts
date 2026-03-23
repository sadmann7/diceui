import * as React from "react";

const MOBILE_BREAKPOINT = 768;

function getServerSnapshot() {
  return false;
}

function useIsMobile(breakpoint = MOBILE_BREAKPOINT) {
  const getSnapshot = React.useCallback(
    () => window.innerWidth < breakpoint,
    [breakpoint],
  );

  const subscribe = React.useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [breakpoint],
  );

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export { useIsMobile };
