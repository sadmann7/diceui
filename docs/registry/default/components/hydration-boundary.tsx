"use client";

import * as React from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function HydrationBoundary({
  children,
  fallback = null,
}: HydrationBoundaryProps) {
  const [mounted, setMounted] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;

  return children;
}

export { HydrationBoundary };
