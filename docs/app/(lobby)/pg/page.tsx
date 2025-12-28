import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TextSelectionMenuDemo from "@/registry/default/examples/text-selection-menu-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TextSelectionMenuDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
