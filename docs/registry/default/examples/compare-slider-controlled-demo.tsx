"use client";

import { RotateCcwIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderControlledDemo() {
  const [value, setValue] = React.useState(50);

  const onReset = React.useCallback(() => {
    setValue(50);
  }, []);

  return (
    <div className="flex w-full max-w-4xl flex-col gap-4">
      <CompareSlider
        value={value}
        onValueChange={setValue}
        className="h-[400px] overflow-hidden rounded-lg border"
      >
        <CompareSliderBefore label="Original">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Original"
            className="h-full w-full object-cover"
          />
        </CompareSliderBefore>
        <CompareSliderAfter label="Enhanced">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=50"
            alt="Enhanced"
            className="h-full w-full object-cover"
          />
        </CompareSliderAfter>
        <CompareSliderHandle />
      </CompareSlider>
      <div className="flex items-center gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label>Position: {value.toFixed(0)}%</Label>
          <Slider
            value={[value]}
            onValueChange={(vals) => setValue(vals[0] ?? 50)}
            min={0}
            max={100}
            step={1}
          />
        </div>
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcwIcon />
          Reset
        </Button>
      </div>
    </div>
  );
}
