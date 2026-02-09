"use client";

import * as React from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useLayoutEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return fallback;

  return children;
}

export { ClientOnly };
