"use client";

import * as React from "react";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressLabel,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/default/ui/circular-progress";

export default function CircularProgressDemo() {
  const [value, setValue] = React.useState<number | null>(33);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <CircularProgress
          value={value}
          onValueChange={setValue}
          className="h-16 w-16"
        >
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
          <CircularProgressValueText />
        </CircularProgress>

        <CircularProgress value={66} className="h-16 w-16">
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
          <CircularProgressLabel>Loading...</CircularProgressLabel>
        </CircularProgress>

        <CircularProgress value={null} className="h-16 w-16">
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
        </CircularProgress>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setValue(Math.max(0, (value ?? 0) - 10))}
          className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm"
        >
          -10
        </button>
        <button
          onClick={() => setValue(Math.min(100, (value ?? 0) + 10))}
          className="rounded bg-primary px-3 py-1 text-primary-foreground text-sm"
        >
          +10
        </button>
        <button
          onClick={() => setValue(null)}
          className="rounded bg-secondary px-3 py-1 text-secondary-foreground text-sm"
        >
          Indeterminate
        </button>
        <span className="text-muted-foreground text-sm">
          Value: {value ?? "indeterminate"}
        </span>
      </div>
    </div>
  );
}
