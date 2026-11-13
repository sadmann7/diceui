"use client";

import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/bases/base/ui/gauge";

export default function GaugePreview() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <Gauge
        value={74}
        size={180}
        thickness={14}
        startAngle={-90}
        endAngle={90}
      >
        <GaugeIndicator>
          <GaugeTrack />
          <GaugeRange />
        </GaugeIndicator>
        <GaugeValueText />
        <GaugeLabel>Capacity</GaugeLabel>
      </Gauge>
    </div>
  );
}
