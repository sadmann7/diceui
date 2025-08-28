"use client";

import * as React from "react";
import { type Options, scan } from "react-scan";
import { ENABLE_REACT_SCAN } from "@/lib/constants";

interface ReactScanProps
  extends Pick<Options, "enabled" | "trackUnnecessaryRenders"> {
  children?: React.ReactNode;
}

export function ReactScan({
  children,
  enabled = ENABLE_REACT_SCAN,
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
