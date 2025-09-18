"use client";

import * as React from "react";
import * as AngularSlider from "@/registry/default/ui/angular-slider";

export default function AngularSliderDemo() {
  const [singleValue, setSingleValue] = React.useState([50]);
  const [rangeValue, setRangeValue] = React.useState([25, 75]);

  return (
    <div className="space-y-12 p-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Single Value Angular Slider</h3>
        <div className="flex flex-col items-center space-y-4">
          <AngularSlider.Root
            value={singleValue}
            onValueChange={setSingleValue}
            max={100}
            min={0}
            step={1}
            radius={60}
          >
            <AngularSlider.Track>
              <AngularSlider.Range />
            </AngularSlider.Track>
            <AngularSlider.Thumb />
          </AngularSlider.Root>
          <p className="text-muted-foreground text-sm">
            Value: {singleValue[0]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Range Angular Slider</h3>
        <div className="flex flex-col items-center space-y-4">
          <AngularSlider.Root
            value={rangeValue}
            onValueChange={setRangeValue}
            max={100}
            min={0}
            step={1}
            radius={80}
          >
            <AngularSlider.Track>
              <AngularSlider.Range />
            </AngularSlider.Track>
            <AngularSlider.Thumb index={0} />
            <AngularSlider.Thumb index={1} />
          </AngularSlider.Root>
          <p className="text-muted-foreground text-sm">
            Range: {rangeValue[0]} - {rangeValue[1]}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Partial Arc Slider</h3>
        <div className="flex flex-col items-center space-y-4">
          <AngularSlider.Root
            defaultValue={[30]}
            max={100}
            min={0}
            step={1}
            radius={70}
            startAngle={-135}
            endAngle={135}
          >
            <AngularSlider.Track>
              <AngularSlider.Range />
            </AngularSlider.Track>
            <AngularSlider.Thumb />
          </AngularSlider.Root>
          <p className="text-muted-foreground text-sm">270° arc slider</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Disabled Angular Slider</h3>
        <div className="flex flex-col items-center space-y-4">
          <AngularSlider.Root
            defaultValue={[60]}
            max={100}
            min={0}
            step={1}
            radius={50}
            disabled
          >
            <AngularSlider.Track>
              <AngularSlider.Range />
            </AngularSlider.Track>
            <AngularSlider.Thumb />
          </AngularSlider.Root>
          <p className="text-muted-foreground text-sm">Disabled state</p>
        </div>
      </div>
    </div>
  );
}
