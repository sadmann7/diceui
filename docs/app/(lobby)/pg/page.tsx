import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import SelectionToolbarDemo from "@/registry/default/examples/selection-toolbar-demo";
import SelectionToolbarRichDemo from "@/registry/default/examples/selection-toolbar-rich-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <SelectionToolbarDemo />
        <SelectionToolbarRichDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
