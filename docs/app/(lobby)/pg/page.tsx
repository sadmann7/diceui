import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import CompareSliderDemo from "@/registry/default/examples/compare-slider-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <CompareSliderDemo />
        <ScrollSpyDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
