"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Gauge,
  GaugeIndicator,
  GaugeLabel,
  GaugeRange,
  GaugeTrack,
  GaugeValueText,
} from "@/registry/default/ui/gauge";

const themes = [
  {
    name: "CPU",
    value: 72,
    trackClass: "text-blue-200 dark:text-blue-900",
    rangeClass: "text-blue-500",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "Memory",
    value: 85,
    trackClass: "text-purple-200 dark:text-purple-900",
    rangeClass: "text-purple-500",
    textClass: "text-purple-700 dark:text-purple-300",
  },
  {
    name: "Disk",
    value: 45,
    trackClass: "text-green-200 dark:text-green-900",
    rangeClass: "text-green-500",
    textClass: "text-green-700 dark:text-green-300",
  },
  {
    name: "Network",
    value: 93,
    trackClass: "text-orange-200 dark:text-orange-900",
    rangeClass: "text-orange-500",
    textClass: "text-orange-700 dark:text-orange-300",
  },
];

export default function GaugeColorsDemo() {
  const [displayValues, setDisplayValues] = React.useState(themes.map(() => 0));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDisplayValues((prev) =>
        prev.map((val, idx) => {
          const target = themes[idx]?.value ?? 0;
          if (val >= target) return target;
          return val + 1;
        }),
      );
    }, 20);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
      {themes.map((theme, index) => (
        <div key={theme.name} className="flex flex-col items-center gap-3">
          <Gauge value={displayValues[index]} size={120} thickness={10}>
            <GaugeIndicator>
              <GaugeTrack className={theme.trackClass} />
              <GaugeRange className={theme.rangeClass} />
            </GaugeIndicator>
            <GaugeValueText className={cn("text-xl", theme.textClass)} />
            <GaugeLabel>{theme.name}</GaugeLabel>
          </Gauge>
        </div>
      ))}
    </div>
  );
}
