"use client";

import * as React from "react";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/bases/radix/ui/circular-progress";

export default function CircularProgressDemo() {
  const [value, setValue] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  return (
    <CircularProgress value={value} size={60}>
      <CircularProgressIndicator>
        <CircularProgressTrack />
        <CircularProgressRange />
      </CircularProgressIndicator>
      <CircularProgressValueText />
    </CircularProgress>
  );
}
