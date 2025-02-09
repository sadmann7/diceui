"use client";

import * as React from "react";

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
