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
    <div className="flex flex-1 flex-col items-center justify-center gap-2">
      <div className="h-[136px] overflow-hidden">
        <Gauge
          value={74}
          size={220}
          thickness={16}
          startAngle={-90}
          endAngle={90}
        >
          <GaugeIndicator>
            <GaugeTrack />
            <GaugeRange />
          </GaugeIndicator>
          <GaugeValueText />
          <GaugeLabel className="sr-only">Capacity</GaugeLabel>
        </Gauge>
      </div>
      <span aria-hidden="true" className="text-sm text-muted-foreground">
        Capacity
      </span>
    </div>
  );
}
