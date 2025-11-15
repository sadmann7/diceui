import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
  CompareSliderLabel,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderVerticalDemo() {
  return (
    <div className="flex h-[600px] w-full max-w-md items-center justify-center">
      <CompareSlider
        defaultValue={50}
        orientation="vertical"
        className="h-full w-full overflow-hidden rounded-lg border"
      >
        <CompareSliderBefore label="Before">
          {/** biome-ignore lint/performance/noImgElement: used for demo */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Before"
            className="size-full object-cover"
          />
        </CompareSliderBefore>
        <CompareSliderAfter label="After">
          {/** biome-ignore lint/performance/noImgElement: used for demo */}
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=-100"
            alt="After"
            className="size-full object-cover grayscale"
          />
        </CompareSliderAfter>
        <CompareSliderHandle />
      </CompareSlider>
    </div>
  );
}
