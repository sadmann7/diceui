import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import StatDemoBase from "@/registry/bases/base/examples/stat-demo";
import ColorPickerDemo from "@/registry/bases/radix/examples/color-picker-demo";
import StatDemo from "@/registry/bases/radix/examples/stat-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StatDemo />
        <StatDemoBase />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
