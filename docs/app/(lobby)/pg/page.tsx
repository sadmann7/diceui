import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import ScrollSpyControlledDemo from "@/registry/default/examples/scroll-spy-controlled-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import ScrollSpyVerticalDemo from "@/registry/default/examples/scroll-spy-vertical-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ScrollSpyDemo />
        <ScrollSpyControlledDemo />
        <ScrollSpyVerticalDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
