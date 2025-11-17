import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import FpsDemo from "@/registry/default/examples/fps-demo";
import FpsStrategyDemo from "@/registry/default/examples/fps-strategy-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <FpsDemo />
        <FpsStrategyDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
