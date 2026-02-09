import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/bases/radix/ui/compare-slider";

export default function CompareSliderVerticalDemo() {
  return (
    <CompareSlider
      defaultValue={50}
      orientation="vertical"
      className="h-[400px] w-full overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore>
        {/* biome-ignore lint/performance/noImgElement: Demo image for comparison slider */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
          alt="Before"
          className="size-full object-cover"
        />
      </CompareSliderBefore>
      <CompareSliderAfter>
        {/* biome-ignore lint/performance/noImgElement: Demo image for comparison slider */}
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=-100"
          alt="After"
          className="size-full object-cover grayscale"
        />
      </CompareSliderAfter>
      <CompareSliderHandle />
    </CompareSlider>
  );
}
