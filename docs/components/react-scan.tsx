"use client";

import { type Options, scan } from "react-scan";

import * as React from "react";

interface ReactScanProps
  extends Pick<Options, "enabled" | "trackUnnecessaryRenders"> {
  children?: React.ReactNode;
}

export function ReactScan({
  children,
  enabled = true,
  trackUnnecessaryRenders = true,
}: ReactScanProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    scan({
      enabled,
      trackUnnecessaryRenders,
    });
  }, [enabled, trackUnnecessaryRenders]);

  return <>{children}</>;
}
