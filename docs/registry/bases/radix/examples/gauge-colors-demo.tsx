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
} from "@/registry/bases/radix/ui/gauge";

const themes = [
  {
    name: "CPU",
    value: 45,
    trackClass: "text-emerald-200 dark:text-emerald-900",
    rangeClass: "text-emerald-500",
    textClass: "text-emerald-700 dark:text-emerald-300",
  },
  {
    name: "Memory",
    value: 68,
    trackClass: "text-amber-200 dark:text-amber-900",
    rangeClass: "text-amber-500",
    textClass: "text-amber-700 dark:text-amber-300",
  },
  {
    name: "Disk",
    value: 92,
    trackClass: "text-red-200 dark:text-red-900",
    rangeClass: "text-red-500",
    textClass: "text-red-700 dark:text-red-300",
  },
  {
    name: "Network",
    value: 28,
    trackClass: "text-sky-200 dark:text-sky-900",
    rangeClass: "text-sky-500",
    textClass: "text-sky-700 dark:text-sky-300",
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
