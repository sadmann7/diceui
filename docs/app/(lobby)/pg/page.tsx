import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import BadgeOverflowDemo from "@/registry/default/examples/badge-overflow-demo";
import BadgeOverflowFormDemo from "@/registry/default/examples/badge-overflow-form-demo";
import BadgeOverflowMultilineDemo from "@/registry/default/examples/badge-overflow-multiline-demo";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <BadgeOverflowDemo />
        <BadgeOverflowMultilineDemo />
        <BadgeOverflowFormDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
