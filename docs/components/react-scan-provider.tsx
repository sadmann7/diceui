"use client";
import { scan } from "react-scan";

import * as React from "react";

interface ReactScanProviderProps {
  children: React.ReactNode;
}

export function ReactScanProvider({ children }: ReactScanProviderProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    scan({
      enabled: true,
      trackUnnecessaryRenders: true,
    });
  }, []);

  return <>{children}</>;
}
