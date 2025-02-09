"use client";

import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;

  return children;
}

export { ClientOnly };
