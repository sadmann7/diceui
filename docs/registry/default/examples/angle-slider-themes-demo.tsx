import {
  AngleSlider,
  AngleSliderRange,
  AngleSliderThumb,
  AngleSliderTrack,
  AngleSliderValue,
} from "@/registry/default/ui/angle-slider";

export default function AngleSliderThemesDemo() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">Default</h3>
        <AngleSlider defaultValue={[60]} max={360} min={0} step={1} radius={60}>
          <AngleSliderTrack>
            <AngleSliderRange />
          </AngleSliderTrack>
          <AngleSliderThumb />
          <AngleSliderValue />
        </AngleSlider>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">Success</h3>
        <AngleSlider
          defaultValue={[120]}
          max={360}
          min={0}
          step={1}
          radius={60}
        >
          <AngleSliderTrack className="[&>[data-slot='angle-slider-track-rail']]:stroke-green-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-green-800">
            <AngleSliderRange className="stroke-green-500" />
          </AngleSliderTrack>
          <AngleSliderThumb className="border-green-500 bg-green-50 ring-green-500/50 dark:bg-green-950" />
          <AngleSliderValue className="text-green-700 dark:text-green-300" />
        </AngleSlider>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">Danger</h3>
        <AngleSlider
          defaultValue={[180]}
          max={360}
          min={0}
          step={1}
          radius={60}
        >
          <AngleSliderTrack className="[&>[data-slot='angle-slider-track-rail']]:stroke-red-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-red-800">
            <AngleSliderRange className="stroke-red-500" />
          </AngleSliderTrack>
          <AngleSliderThumb className="border-red-500 bg-red-50 ring-red-500/50 dark:bg-red-950" />
          <AngleSliderValue className="text-red-700 dark:text-red-300" />
        </AngleSlider>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">Warning</h3>
        <AngleSlider
          defaultValue={[240]}
          max={360}
          min={0}
          step={1}
          radius={60}
        >
          <AngleSliderTrack className="[&>[data-slot='angle-slider-track-rail']]:stroke-orange-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-orange-800">
            <AngleSliderRange className="stroke-orange-500" />
          </AngleSliderTrack>
          <AngleSliderThumb className="border-orange-500 bg-orange-50 ring-orange-500/50 dark:bg-orange-950" />
          <AngleSliderValue className="text-orange-700 dark:text-orange-300" />
        </AngleSlider>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">
          Dual Range
        </h3>
        <AngleSlider
          defaultValue={[40, 240]}
          max={360}
          min={0}
          step={1}
          radius={60}
        >
          <AngleSliderTrack className="[&>[data-slot='angle-slider-track-rail']]:stroke-purple-200 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-purple-800">
            <AngleSliderRange className="stroke-purple-500" />
          </AngleSliderTrack>
          <AngleSliderThumb
            index={0}
            className="border-purple-500 bg-purple-50 ring-purple-500/50 dark:bg-purple-950"
          />
          <AngleSliderThumb
            index={1}
            className="border-purple-500 bg-purple-50 ring-purple-500/50 dark:bg-purple-950"
          />
          <AngleSliderValue className="text-purple-700 dark:text-purple-300" />
        </AngleSlider>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <h3 className="font-medium text-muted-foreground text-sm">
          Minimalist
        </h3>
        <AngleSlider
          defaultValue={[90]}
          max={360}
          min={0}
          step={1}
          radius={60}
          trackWidth={2}
        >
          <AngleSliderTrack className="[&>[data-slot='angle-slider-track-rail']]:stroke-gray-300 dark:[&>[data-slot='angle-slider-track-rail']]:stroke-gray-600">
            <AngleSliderRange className="stroke-gray-900 dark:stroke-gray-100" />
          </AngleSliderTrack>
          <AngleSliderThumb className="size-3 border border-gray-900 bg-white ring-gray-900/20 dark:border-gray-100 dark:bg-gray-900 dark:ring-gray-100/20" />
          <AngleSliderValue className="text-gray-600 text-xs dark:text-gray-400" />
        </AngleSlider>
      </div>
    </div>
  );
}
