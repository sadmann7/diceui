"use client";

import * as React from "react";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/default/ui/gauge";

export default function GaugeDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 75) {
          clearInterval(interval);
          return 75;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <Gauge value={value} size={180}>
      <GaugeIndicator>
        <GaugeTrack />
        <GaugeRange />
      </GaugeIndicator>
      <GaugeValueText />
      <GaugeLabel className="sr-only">Performance</GaugeLabel>
    </Gauge>
  );
}
