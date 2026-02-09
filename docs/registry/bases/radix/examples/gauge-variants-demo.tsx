"use client";

import * as React from "react";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/bases/radix/ui/gauge";

const variants = [
  { startAngle: -90, endAngle: 90, label: "Semi Circle" },
  { startAngle: -135, endAngle: 135, label: "Three Quarter" },
  { startAngle: 0, endAngle: 360, label: "Full Circle" },
];

export default function GaugeVariantsDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 72) {
          clearInterval(interval);
          return 72;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-center justify-center gap-12">
      {variants.map((variant) => (
        <div key={variant.label} className="flex flex-col items-center gap-3">
          <Gauge
            value={value}
            size={140}
            thickness={10}
            startAngle={variant.startAngle}
            endAngle={variant.endAngle}
          >
            <GaugeIndicator>
              <GaugeTrack />
              <GaugeRange />
            </GaugeIndicator>
            <GaugeValueText />
            <GaugeLabel>{variant.label}</GaugeLabel>
          </Gauge>
        </div>
      ))}
    </div>
  );
}
