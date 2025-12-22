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

export default function GaugeCircleDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return 85;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <Gauge
      value={value}
      size={180}
      thickness={12}
      startAngle={0}
      endAngle={360}
    >
      <GaugeIndicator>
        <GaugeTrack />
        <GaugeRange />
      </GaugeIndicator>
      <GaugeValueText />
      <GaugeLabel>CPU Usage</GaugeLabel>
    </Gauge>
  );
}

