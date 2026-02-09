import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/radix/examples/color-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
