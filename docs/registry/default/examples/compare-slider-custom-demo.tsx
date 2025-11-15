"use client";

import * as React from "react";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderCustomDemo() {
  return (
    <div className="flex w-full max-w-4xl flex-col gap-8">
      <div>
        <h3 className="mb-4 font-medium text-sm">Vertical Orientation</h3>
        <CompareSlider
          defaultValue={50}
          orientation="vertical"
          className="h-[400px] w-full overflow-hidden rounded-lg border"
        >
          <CompareSliderBefore>
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
              <span className="font-bold text-2xl text-white">Before</span>
            </div>
          </CompareSliderBefore>
          <CompareSliderAfter>
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-pink-500 to-orange-600">
              <span className="font-bold text-2xl text-white">After</span>
            </div>
          </CompareSliderAfter>
          <CompareSliderHandle />
        </CompareSlider>
      </div>

      <div>
        <h3 className="mb-4 font-medium text-sm">Custom Handle</h3>
        <CompareSlider
          defaultValue={50}
          className="h-[300px] overflow-hidden rounded-lg border"
        >
          <CompareSliderBefore>
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center">
                <p className="font-bold text-4xl">Old Design</p>
                <p className="mt-2 text-muted-foreground text-sm">Legacy UI</p>
              </div>
            </div>
          </CompareSliderBefore>
          <CompareSliderAfter>
            <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
              <div className="text-center">
                <p className="font-bold text-4xl">New Design</p>
                <p className="mt-2 text-sm opacity-80">Modern UI</p>
              </div>
            </div>
          </CompareSliderAfter>
          <CompareSliderHandle>
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <span className="font-bold text-xs">VS</span>
            </div>
          </CompareSliderHandle>
        </CompareSlider>
      </div>

      <div>
        <h3 className="mb-4 font-medium text-sm">Custom Labels</h3>
        <CompareSlider
          defaultValue={50}
          className="h-[300px] overflow-hidden rounded-lg border"
        >
          <CompareSliderBefore>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
              alt="Before"
              className="h-full w-full object-cover"
            />
          </CompareSliderBefore>
          <CompareSliderAfter>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=-100"
              alt="After"
              className="h-full w-full object-cover grayscale"
            />
          </CompareSliderAfter>
          <CompareSliderHandle />
          <CompareSliderLabel
            side="before"
            className="bg-blue-500/90 text-white"
          >
            Original
          </CompareSliderLabel>
          <CompareSliderLabel
            side="after"
            className="bg-green-500/90 text-white"
          >
            Processed
          </CompareSliderLabel>
        </CompareSlider>
      </div>
    </div>
  );
}
