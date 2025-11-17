import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TourDemo from "@/registry/default/examples/tour-demo";
import { Fps } from "@/registry/default/ui/fps";

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
