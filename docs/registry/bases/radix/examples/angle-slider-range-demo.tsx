"use client";

import * as React from "react";
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/bases/radix/ui/angle-slider";

export default function AngleSliderRangeDemo() {
  const [value, setValue] = React.useState([90, 270]);

  return (
    <div className="flex flex-col items-center gap-4">
      <AngleSlider
        value={value}
        onValueChange={setValue}
        max={360}
        min={0}
        step={5}
        size={80}
        minStepsBetweenThumbs={2}
      >
        <AngleSliderTrack>
          <AngleSliderRange />
        </AngleSliderTrack>
        <AngleSliderThumb index={0} />
        <AngleSliderThumb index={1} />
        <AngleSliderValue />
      </AngleSlider>
      <div className="flex flex-col gap-2 text-center text-sm">
        <p>
          <strong>Range:</strong> {value[0]}° - {value[1]}°
        </p>
        <p>
          <strong>Arc Length:</strong>{" "}
          {Math.abs((value[1] ?? 0) - (value[0] ?? 0))}°
        </p>
      </div>
    </div>
  );
}
