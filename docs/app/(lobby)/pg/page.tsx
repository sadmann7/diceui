import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TourDemo from "@/registry/default/examples/tour-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TourDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
