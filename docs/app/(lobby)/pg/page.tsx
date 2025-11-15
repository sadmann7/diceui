import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import ScrollSpyControlledDemo from "@/registry/default/examples/scroll-spy-controlled-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import ScrollSpyVerticalDemo from "@/registry/default/examples/scroll-spy-vertical-demo";
import StackDemo from "@/registry/default/examples/stack-demo";
import StackSideDemo from "@/registry/default/examples/stack-side-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StackDemo />
        <StackSideDemo />
        <ScrollSpyDemo />
        <ScrollSpyControlledDemo />
        <ScrollSpyVerticalDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
