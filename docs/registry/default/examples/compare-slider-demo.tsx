import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderDemo() {
  return (
    <div className="w-full max-w-4xl">
      <CompareSlider defaultValue={50} className="h-[400px] rounded-lg overflow-hidden border">
        <CompareSliderBefore label="Before">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Before"
            className="h-full w-full object-cover"
          />
        </CompareSliderBefore>
        <CompareSliderAfter label="After">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=-100"
            alt="After"
            className="h-full w-full object-cover grayscale"
          />
        </CompareSliderAfter>
        <CompareSliderHandle />
      </CompareSlider>
    </div>
  );
}

