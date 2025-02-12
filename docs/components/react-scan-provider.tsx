"use client";

import type * as React from "react";

import { scan } from "react-scan";

if (typeof window !== "undefined") {
  scan({
    enabled: true,
    trackUnnecessaryRenders: true,
  });
}

interface ReactScanProviderProps {
  children: React.ReactNode;
}

export function ReactScanProvider({ children }: ReactScanProviderProps) {
  return <>{children}</>;
}
