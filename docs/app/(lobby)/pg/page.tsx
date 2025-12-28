import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import SelectionToolbarDemo from "@/registry/default/examples/selection-toolbar-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <SelectionToolbarDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
