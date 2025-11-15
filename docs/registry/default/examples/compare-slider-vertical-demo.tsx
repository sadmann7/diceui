import Image from "next/image";
import {
  CompareSlider,
  CompareSliderAfter,
  CompareSliderBefore,
  CompareSliderHandle,
} from "@/registry/default/ui/compare-slider";

export default function CompareSliderVerticalDemo() {
  return (
    <CompareSlider
      defaultValue={50}
      orientation="vertical"
      className="h-[400px] w-full overflow-hidden rounded-lg border"
    >
      <CompareSliderBefore label="Before">
        <div className="relative size-full">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Before"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
      </CompareSliderBefore>
      <CompareSliderAfter label="After">
        <div className="relative size-full">
          <Image
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80&sat=-100"
            alt="After"
            fill
            sizes="100vw"
            className="object-cover grayscale"
          />
        </div>
      </CompareSliderAfter>
      <CompareSliderHandle />
    </CompareSlider>
  );
}
