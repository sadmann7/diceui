import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import CompareSliderControlledDemo from "@/registry/default/examples/compare-slider-controlled-demo";
import CompareSliderCustomizationDemo from "@/registry/default/examples/compare-slider-customization-demo";
import CompareSliderDemo from "@/registry/default/examples/compare-slider-demo";
import CompareSliderVerticalDemo from "@/registry/default/examples/compare-slider-vertical-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import TourDemo from "@/registry/default/examples/tour-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TourDemo />
        <CompareSliderDemo />
        <CompareSliderCustomizationDemo />
        <CompareSliderControlledDemo />
        <CompareSliderVerticalDemo />
        <ScrollSpyDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
