import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import { Fps } from "@/registry/default/components/fps";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TourDemo from "@/registry/default/examples/tour-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <Fps position="bottom-right" />
        <TourDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
