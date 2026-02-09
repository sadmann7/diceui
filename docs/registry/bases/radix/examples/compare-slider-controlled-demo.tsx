"use client";

import * as React from "react";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/bases/radix/ui/compare-slider";

export default function CompareSliderControlledDemo() {
  const [value, setValue] = React.useState(30);

  return (
    <CompareSlider
      value={value}
      onValueChange={setValue}
      className="h-[400px] overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore label="Original">
        {/* biome-ignore lint/performance/noImgElement: Demo image for comparison slider */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
          alt="Original"
          className="size-full object-cover"
        />
      </CompareSliderBefore>
      <CompareSliderAfter label="Enhanced">
        {/* biome-ignore lint/performance/noImgElement: Demo image for comparison slider */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=50"
          alt="Enhanced"
          className="size-full object-cover"
        />
      </CompareSliderAfter>
      <CompareSliderHandle />
    </CompareSlider>
  );
}
