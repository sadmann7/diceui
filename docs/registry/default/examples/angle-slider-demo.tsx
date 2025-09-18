"use client";

import * as React from "react";
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/default/ui/angle-slider";

export default function AngleSliderDemo() {
  const [singleValue, setSingleValue] = React.useState([180]);
  const [rangeValue, setRangeValue] = React.useState([90, 270]);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Single Value Angle Slider</h3>
        <AngleSlider
          value={singleValue}
          onValueChange={setSingleValue}
          max={360}
          min={0}
          step={1}
          radius={60}
        >
          <AngleSliderTrack>
            <AngleSliderRange />
          </AngleSliderTrack>
          <AngleSliderThumb />
          <AngleSliderValue />
        </AngleSlider>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Range Angle Slider</h3>
        <AngleSlider
          value={rangeValue}
          onValueChange={setRangeValue}
          max={360}
          min={0}
          step={1}
          radius={80}
        >
          <AngleSliderTrack>
            <AngleSliderRange />
          </AngleSliderTrack>
          <AngleSliderThumb index={0} />
          <AngleSliderThumb index={1} />
          <AngleSliderValue />
        </AngleSlider>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Percentage Slider</h3>
        <AngleSlider defaultValue={[75]} max={100} min={0} step={1} radius={70}>
          <AngleSliderTrack>
            <AngleSliderRange />
          </AngleSliderTrack>
          <AngleSliderThumb />
          <AngleSliderValue unit="%" />
        </AngleSlider>
      </div>
      <div className="flex flex-col gap-4">
        <h3 className="font-semibold text-lg">Disabled Angle Slider</h3>
        <AngleSlider
          defaultValue={[216]}
          max={360}
          min={0}
          step={1}
          radius={50}
          disabled
        >
          <AngleSliderTrack>
            <AngleSliderRange />
          </AngleSliderTrack>
          <AngleSliderThumb />
          <AngleSliderValue />
        </AngleSlider>
      </div>
    </div>
  );
}
