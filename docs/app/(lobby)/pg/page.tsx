import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import ScrollSpyControlledDemo from "@/registry/default/examples/scroll-spy-controlled-demo";
import ScrollSpyDemo from "@/registry/default/examples/scroll-spy-demo";
import ScrollSpyVerticalDemo from "@/registry/default/examples/scroll-spy-vertical-demo";
import StackCustomDemo from "@/registry/default/examples/stack-custom-demo";
import StackDemo from "@/registry/default/examples/stack-demo";
import StackNoExpandDemo from "@/registry/default/examples/stack-no-expand-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StackDemo />
        <StackCustomDemo />
        <StackNoExpandDemo />
        <ScrollSpyDemo />
        <ScrollSpyControlledDemo />
        <ScrollSpyVerticalDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
