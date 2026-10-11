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

// Native hash links (e.g. the table of contents) push history entries with a
// null state, and the Next.js app router ignores popstate for those. Going
// back to such an entry from another page then updates the URL but keeps the
// other page rendered. Copy the router state onto hash entries so back
// navigation restores the page they belong to.
export function HashHistorySync() {
  const pathname = usePathname();
  const routerStateRef = React.useRef<NextHistoryState | null>(null);
  const pendingHashRef = React.useRef<{
    pathname: string;
    hash: string;
  } | null>(null);

  // Runs after each route change, once the router has written its state
  React.useEffect(() => {
    const state = getNextHistoryState(window.history.state);
    if (state) routerStateRef.current = state;

    // The router restores the page without scrolling to its hash
    const pending = pendingHashRef.current;
    if (pending?.pathname !== pathname) return;

    pendingHashRef.current = null;
    document.getElementById(pending.hash)?.scrollIntoView();
  }, [pathname]);

  // Reads `pathname` from the latest render: the page shown before the
  // router reacts to this popstate
  const onPopState = React.useEffectEvent((event: PopStateEvent) => {
    const state = getNextHistoryState(event.state);
    if (state) routerStateRef.current = state;

    // Same-page hash changes are scrolled by the browser
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

    function onPopStateListener(event: PopStateEvent) {
      onPopState(event);
    }

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopStateListener);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopStateListener);
    };
  }, []);

  return null;
}
