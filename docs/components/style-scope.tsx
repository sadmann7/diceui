"use client";

import * as React from "react";

import { getStyleMap, loadStyleMap, setMarkerStyle } from "@/lib/marker-style";
import { getServerStyle, getStyle, subscribeStyle } from "@/lib/style";

export function StyleScope({ children }: { children: React.ReactNode }) {
  const selected = React.useSyncExternalStore(
    subscribeStyle,
    getStyle,
    getServerStyle,
  );
  const [loaded, setLoaded] = React.useState(getServerStyle);

  React.useEffect(() => {
    let active = true;
    loadStyleMap(selected)
      .then(() => {
        if (active) setLoaded(selected);
      })
      // If a style fails to load, previews stay in the current one.
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [selected]);

  const style = getStyleMap(selected) ? selected : loaded;
  setMarkerStyle(style);

  return <React.Fragment key={style}>{children}</React.Fragment>;
}
