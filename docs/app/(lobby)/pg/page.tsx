import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TourControlledDemo from "@/registry/default/examples/tour-controlled-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TourControlledDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
