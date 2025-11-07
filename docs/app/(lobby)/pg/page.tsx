import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ScrollSpyDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
