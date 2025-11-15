"use client";

import Image from "next/image";
import * as React from "react";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderControlledDemo() {
  const [value, setValue] = React.useState(30);

  return (
    <CompareSlider
      value={value}
      onValueChange={setValue}
      className="h-[400px] overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore label="Original">
        <div className="relative size-full">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Original"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </CompareSliderBefore>
      <CompareSliderAfter label="Enhanced">
        <div className="relative size-full">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=50"
            alt="Enhanced"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </CompareSliderAfter>
      <CompareSliderHandle />
    </CompareSlider>
  );
}
