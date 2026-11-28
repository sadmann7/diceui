"use client";

import { useIsHydrated } from "@base-ui/utils/hydration";
import * as React from "react";

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const mounted = useIsHydrated();

  if (!mounted) return fallback;

  return children;
}

export { ClientOnly };
