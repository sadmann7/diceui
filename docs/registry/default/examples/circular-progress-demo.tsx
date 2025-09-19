"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/default/ui/circular-progress";

export default function CircularProgressDemo() {
  const [value, setValue] = React.useState<number | null>(33);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <CircularProgress value={value} onValueChange={setValue} size={60}>
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
          <CircularProgressValueText />
        </CircularProgress>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={() => setValue(Math.max(0, (value ?? 0) - 10))}
        >
          -10
        </Button>
        <Button
          size="sm"
          onClick={() => setValue(Math.min(100, (value ?? 0) + 10))}
        >
          +10
        </Button>
        <Button variant="secondary" size="sm" onClick={() => setValue(null)}>
          Indeterminate
        </Button>
      </div>
    </div>
  );
}
