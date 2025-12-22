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

const sizes = [
  { size: 100, thickness: 6, label: "Small" },
  { size: 140, thickness: 10, label: "Medium" },
  { size: 180, thickness: 12, label: "Large" },
];

export default function GaugeSizesDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 68) {
          clearInterval(interval);
          return 68;
        }
        return prev + 1;
      });
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-wrap items-end justify-center gap-8">
      {sizes.map((config) => (
        <div key={config.label} className="flex flex-col items-center gap-2">
          <Gauge
            value={value}
            size={config.size}
            thickness={config.thickness}
            startAngle={-90}
            endAngle={90}
          >
            <GaugeIndicator>
              <GaugeTrack />
              <GaugeRange />
            </GaugeIndicator>
            <GaugeValueText className={config.size < 140 ? "text-xl" : ""} />
          </Gauge>
          <p className="text-muted-foreground text-sm">{config.label}</p>
        </div>
      ))}
    </div>
  );
}
