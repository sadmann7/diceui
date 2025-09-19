"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/default/ui/angle-slider";

export default function AngleSliderControlledDemo() {
  const [value, setValue] = React.useState([180]);

  const onReset = React.useCallback(() => {
    setValue([0]);
  }, []);

  const onRandomize = React.useCallback(() => {
    setValue([Math.floor(Math.random() * 360)]);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
        <Button variant="outline" onClick={onRandomize}>
          Randomize
        </Button>
      </div>

      <AngleSlider
        value={value}
        onValueChange={setValue}
        max={360}
        min={0}
        step={1}
        radius={80}
      >
        <AngleSliderTrack>
          <AngleSliderRange />
        </AngleSliderTrack>
        <AngleSliderThumb />
        <AngleSliderValue />
      </AngleSlider>

      <div className="flex flex-col gap-2 text-sm">
        <p>
          <strong>Current Value:</strong> {value[0]}°
        </p>
        <p>
          <strong>Radians:</strong> {((value[0] * Math.PI) / 180).toFixed(3)}
        </p>
      </div>
    </div>
  );
}
