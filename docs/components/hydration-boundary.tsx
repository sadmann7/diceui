"use client";

import { useMounted } from "@/hooks/use-mounted";
import type * as React from "react";

interface HydrationBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HydrationBoundary({
  children,
  fallback = null,
}: HydrationBoundaryProps) {
  const isMounted = useMounted();

  if (!isMounted) return fallback;

  return children;
}
