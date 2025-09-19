"use client";

import * as React from "react";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/default/ui/circular-progress";

const themes = [
  {
    name: "Default",
    trackClass: "text-muted-foreground/20",
    rangeClass: "text-primary",
    textClass: "text-foreground",
  },
  {
    name: "Success",
    trackClass: "text-green-200 dark:text-green-900",
    rangeClass: "text-green-500",
    textClass: "text-green-700 dark:text-green-300",
  },
  {
    name: "Warning",
    trackClass: "text-yellow-200 dark:text-yellow-900",
    rangeClass: "text-yellow-500",
    textClass: "text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "Destructive",
    trackClass: "text-red-200 dark:text-red-900",
    rangeClass: "text-red-500",
    textClass: "text-red-700 dark:text-red-300",
  },
  {
    name: "Purple",
    trackClass: "text-purple-200 dark:text-purple-900",
    rangeClass: "text-purple-500",
    textClass: "text-purple-700 dark:text-purple-300",
  },
  {
    name: "Orange",
    trackClass: "text-orange-200 dark:text-orange-900",
    rangeClass: "text-orange-500",
    textClass: "text-orange-700 dark:text-orange-300",
  },
  {
    name: "Blue",
    trackClass: "text-blue-200 dark:text-blue-900",
    rangeClass: "text-blue-500",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "Pink",
    trackClass: "text-pink-200 dark:text-pink-900",
    rangeClass: "text-pink-500",
    textClass: "text-pink-700 dark:text-pink-300",
  },
];

export default function CircularProgressThemesDemo() {
  const [value, setValue] = React.useState(65);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        const next = prev + 1;
        return next > 100 ? 0 : next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
      {themes.map((theme) => (
        <div key={theme.name} className="flex flex-col items-center gap-3">
          <CircularProgress value={value} size={80} trackWidth={6}>
            <CircularProgressIndicator>
              <CircularProgressTrack className={theme.trackClass} />
              <CircularProgressRange className={theme.rangeClass} />
            </CircularProgressIndicator>
            <CircularProgressValueText
              className={`font-semibold text-sm ${theme.textClass}`}
            />
          </CircularProgress>
          <div className="text-center">
            <div className="font-medium text-sm">{theme.name}</div>
            <div className="text-muted-foreground text-xs">
              {value}% complete
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
