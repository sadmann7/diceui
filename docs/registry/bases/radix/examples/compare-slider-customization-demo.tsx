"use client";

import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/bases/radix/ui/compare-slider";

export default function CompareSliderCustomDemo() {
  return (
    <CompareSlider
      defaultValue={50}
      className="h-[300px] overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore className="flex size-full items-center justify-center bg-muted text-center">
        <div className="font-bold text-2xl">Kickflip</div>
      </CompareSliderBefore>
      <CompareSliderAfter className="flex size-full items-center justify-center bg-primary text-center text-primary-foreground">
        <div className="font-bold text-2xl">Heelflip</div>
      </CompareSliderAfter>
      <CompareSliderHandle>
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
          <span className="font-bold text-xs">VS</span>
        </div>
      </CompareSliderHandle>
    </CompareSlider>
  );
}
