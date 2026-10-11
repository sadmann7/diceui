"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

interface NextHistoryState {
  __NA?: boolean;
  __PRIVATE_NEXTJS_INTERNALS_TREE?: unknown;
}

function getNextHistoryState(state: unknown): NextHistoryState | null {
  if (typeof state !== "object" || state === null) return null;
  return "__NA" in state ? (state as NextHistoryState) : null;
}

export function HashHistorySync() {
  const pathname = usePathname();
  const routerStateRef = React.useRef<NextHistoryState | null>(null);
  const pendingHashRef = React.useRef<{
    pathname: string;
    hash: string;
  } | null>(null);

  React.useEffect(() => {
    const state = getNextHistoryState(window.history.state);
    if (state) routerStateRef.current = state;

    const pending = pendingHashRef.current;
    if (pending?.pathname !== pathname) return;

    pendingHashRef.current = null;
    document.getElementById(pending.hash)?.scrollIntoView();
  }, [pathname]);

  const onPopStateEvent = React.useEffectEvent((event: PopStateEvent) => {
    const state = getNextHistoryState(event.state);
    if (state) routerStateRef.current = state;

    const hash = decodeURIComponent(window.location.hash.slice(1));
    const nextPathname = window.location.pathname;
    pendingHashRef.current =
      hash && nextPathname !== pathname
        ? { pathname: nextPathname, hash }
        : null;
  });

  React.useEffect(() => {
    function onHashChange() {
      const routerState = routerStateRef.current;
      if (!routerState || getNextHistoryState(window.history.state)) return;

      window.history.replaceState({ ...routerState }, "", window.location.href);
    }

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopStateEvent);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopStateEvent);
    };
  }, []);

  return null;
}
