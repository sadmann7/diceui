"use client";

import { useEffect } from "react";
import { init } from "onedollarstats";

export function AnalyticsProvider() {
  useEffect(() => {
    init({
      siteId: "diceui.com",
      trackLocalHostAs: "diceui.com",
    });

    // eslint-disable-next-line no-console
    console.log("📊 OneDollarStats initialized");
  }, []);

  return null;
}

