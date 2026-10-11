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
  const pathnameRef = React.useRef(pathname);
  const pendingHashRef = React.useRef<string | null>(null);

  // Runs after each route change, once the router has written its state
  React.useEffect(() => {
    pathnameRef.current = pathname;

    const state = getNextHistoryState(window.history.state);
    if (state) routerStateRef.current = state;

    // The router restores the page without scrolling to its hash
    const hash = pendingHashRef.current;
    pendingHashRef.current = null;
    if (hash) document.getElementById(hash)?.scrollIntoView();
  }, [pathname]);

  React.useEffect(() => {
    function onHashChange() {
      const routerState = routerStateRef.current;
      if (!routerState || getNextHistoryState(window.history.state)) return;

      window.history.replaceState({ ...routerState }, "", window.location.href);
    }

    function onPopState(event: PopStateEvent) {
      const state = getNextHistoryState(event.state);
      if (state) routerStateRef.current = state;

      // Same-page hash changes are scrolled by the browser
      const hash = decodeURIComponent(window.location.hash.slice(1));
      pendingHashRef.current =
        hash && window.location.pathname !== pathnameRef.current ? hash : null;
    }

    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
