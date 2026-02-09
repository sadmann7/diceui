import { cn } from "@/lib/utils";
import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/bases/radix/ui/angle-slider";

const themes = [
  {
    name: "Default",
    value: 60,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-muted-foreground/20",
    rangeClass: "stroke-primary",
    thumbClass: "border-primary bg-background ring-primary/50",
    textClass: "text-foreground",
  },
  {
    name: "Success",
    value: 120,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-green-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-green-900",
    rangeClass: "stroke-green-500",
    thumbClass:
      "border-green-500 bg-green-50 ring-green-500/50 dark:bg-green-950",
    textClass: "text-green-700 dark:text-green-300",
  },
  {
    name: "Warning",
    value: 180,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-yellow-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-yellow-900",
    rangeClass: "stroke-yellow-500",
    thumbClass:
      "border-yellow-500 bg-yellow-50 ring-yellow-500/50 dark:bg-yellow-950",
    textClass: "text-yellow-700 dark:text-yellow-300",
  },
  {
    name: "Destructive",
    value: 240,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-red-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-red-900",
    rangeClass: "stroke-red-500",
    thumbClass: "border-red-500 bg-red-50 ring-red-500/50 dark:bg-red-950",
    textClass: "text-red-700 dark:text-red-300",
  },
  {
    name: "Purple",
    value: 300,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-purple-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-purple-900",
    rangeClass: "stroke-purple-500",
    thumbClass:
      "border-purple-500 bg-purple-50 ring-purple-500/50 dark:bg-purple-950",
    textClass: "text-purple-700 dark:text-purple-300",
  },
  {
    name: "Orange",
    value: 45,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-orange-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-orange-900",
    rangeClass: "stroke-orange-500",
    thumbClass:
      "border-orange-500 bg-orange-50 ring-orange-500/50 dark:bg-orange-950",
    textClass: "text-orange-700 dark:text-orange-300",
  },
  {
    name: "Blue",
    value: 90,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-blue-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-blue-900",
    rangeClass: "stroke-blue-500",
    thumbClass: "border-blue-500 bg-blue-50 ring-blue-500/50 dark:bg-blue-950",
    textClass: "text-blue-700 dark:text-blue-300",
  },
  {
    name: "Pink",
    value: 270,
    trackClass:
      "[&>[data-slot='angle-slider-track-rail']]:stroke-pink-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-pink-900",
    rangeClass: "stroke-pink-500",
    thumbClass: "border-pink-500 bg-pink-50 ring-pink-500/50 dark:bg-pink-950",
    textClass: "text-pink-700 dark:text-pink-300",
  },
];

export default function AngleSliderThemesDemo() {
  return (
    <>
      <div className="hidden grid-cols-4 gap-4 sm:grid">
        {themes.map((theme) => (
          <AngleSliderCard key={theme.name} theme={theme} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:hidden">
        {themes.slice(0, 4).map((theme) => (
          <AngleSliderCard key={theme.name} theme={theme} />
        ))}
      </div>
    </>
  );
}

interface AngleSliderCardProps {
  theme: (typeof themes)[0];
}

function AngleSliderCard({ theme }: AngleSliderCardProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <AngleSlider
        defaultValue={[theme.value]}
        max={360}
        min={0}
        step={1}
        size={60}
      >
        <AngleSliderTrack className={theme.trackClass}>
          <AngleSliderRange className={theme.rangeClass} />
        </AngleSliderTrack>
        <AngleSliderThumb className={theme.thumbClass} />
        <AngleSliderValue
          className={cn("font-semibold text-sm", theme.textClass)}
        />
      </AngleSlider>
      <div className="flex flex-col items-center gap-1 text-center">
        <h4 className="font-medium text-sm">{theme.name}</h4>
        <p className="text-muted-foreground text-xs">{theme.value}°</p>
      </div>
    </div>
  );
}
