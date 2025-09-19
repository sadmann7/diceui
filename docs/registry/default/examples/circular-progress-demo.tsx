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
  const [value, setValue] = React.useState(40);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev + 2) % 100);
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
