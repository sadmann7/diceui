"use client";

import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/bases/base/ui/compare-slider";

export default function CompareSliderCustomDemo() {
  return (
    <CompareSlider
      defaultValue={50}
      className="h-[300px] overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore className="flex size-full items-center justify-center bg-muted text-center">
        <div className="text-2xl font-bold">Kickflip</div>
      </CompareSliderBefore>
      <CompareSliderAfter className="flex size-full items-center justify-center bg-primary text-center text-primary-foreground">
        <div className="text-2xl font-bold">Heelflip</div>
      </CompareSliderAfter>
      <CompareSliderHandle>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <span className="text-xs font-bold">VS</span>
        </div>
      </CompareSliderHandle>
    </CompareSlider>
  );
}
