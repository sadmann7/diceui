"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/default/ui/gauge";

export default function GaugeControlledDemo() {
  const [value, setValue] = React.useState(45);

  return (
    <div className="flex flex-col items-center gap-6">
      <Gauge
        value={value}
        size={180}
        thickness={12}
        startAngle={-90}
        endAngle={90}
      >
        <GaugeIndicator>
          <GaugeTrack />
          <GaugeRange />
        </GaugeIndicator>
        <GaugeValueText />
        <GaugeLabel>Performance</GaugeLabel>
      </Gauge>

      <div className="w-full max-w-xs space-y-4">
        <div className="space-y-2">
          <label className="font-medium text-sm">Adjust Value</label>
          <Slider
            value={[value]}
            onValueChange={(values) => setValue(values[0] ?? 0)}
            max={100}
            step={1}
          />
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setValue(0)}>
            0%
          </Button>
          <Button variant="outline" size="sm" onClick={() => setValue(50)}>
            50%
          </Button>
          <Button variant="outline" size="sm" onClick={() => setValue(100)}>
            100%
          </Button>
        </div>
      </div>
    </div>
  );
}
