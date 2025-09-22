"use client";

import * as React from "react";
import { ENABLE_REACT_SCAN } from "@/lib/constants";

interface ReactScanProps {
  children?: React.ReactNode;
  enabled?: boolean;
  trackUnnecessaryRenders?: boolean;
}

export function ReactScan({
  children,
  enabled = ENABLE_REACT_SCAN,
  trackUnnecessaryRenders = true,
}: ReactScanProps) {
  React.useEffect(() => {
    if (typeof window === "undefined" || !enabled) return;

    // Lazy load react-scan only when needed and in development
    if (process.env.NODE_ENV === "development") {
      import("react-scan").then(({ scan }) => {
        scan({
          enabled,
          trackUnnecessaryRenders,
        });
      });
    }
  }, [enabled, trackUnnecessaryRenders]);

  return <>{children}</>;
}
