"use client";

import { RotateCcwIcon, ShuffleIcon } from "lucide-react";
import { animate } from "motion/react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/bases/radix/ui/angle-slider";

export default function AngleSliderControlledDemo() {
  const [value, setValue] = React.useState([180]);
  const animationRef = React.useRef<ReturnType<typeof animate> | null>(null);

  const animateToValue = React.useCallback(
    (targetValue: number) => {
      if (animationRef.current) {
        animationRef.current.stop();
      }

      const currentValue = value[0] ?? 0;

      let diff = targetValue - currentValue;
      if (diff > 180) {
        diff -= 360;
      } else if (diff < -180) {
        diff += 360;
      }

      animationRef.current = animate(0, diff, {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        onUpdate: (progress: number) => {
          const animatedValue = currentValue + progress;
          const normalizedValue = Math.round(
            ((animatedValue % 360) + 360) % 360,
          );
          setValue([normalizedValue]);
        },
        onComplete: () => {
          setValue([targetValue]);
          animationRef.current = null;
        },
      });
    },
    [value],
  );

  const onReset = React.useCallback(() => {
    animateToValue(0);
  }, [animateToValue]);

  const onRandomize = React.useCallback(() => {
    animateToValue(Math.floor(Math.random() * 360));
  }, [animateToValue]);

  React.useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onReset}>
          <RotateCcwIcon />
          Reset
        </Button>
        <Button size="sm" onClick={onRandomize}>
          <ShuffleIcon />
          Randomize
        </Button>
      </div>
      <AngleSlider
        value={value}
        onValueChange={setValue}
        max={360}
        min={0}
        step={1}
        size={80}
      >
        <AngleSliderTrack>
          <AngleSliderRange />
        </AngleSliderTrack>
        <AngleSliderThumb />
        <AngleSliderValue />
      </AngleSlider>
    </div>
  );
}
