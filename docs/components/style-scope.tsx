"use client";

import * as React from "react";

import { setMarkerStyle } from "@/lib/marker-style";
import { getServerStyle, getStyle, subscribeStyle } from "@/lib/style";

// Renders registry components in the selected style, the way the shadcn CLI
// compiles them, and remounts them when the style changes.
export function StyleScope({ children }: { children: React.ReactNode }) {
  const style = React.useSyncExternalStore(
    subscribeStyle,
    getStyle,
    getServerStyle,
  );
  setMarkerStyle(style);

  return <React.Fragment key={style}>{children}</React.Fragment>;
}
