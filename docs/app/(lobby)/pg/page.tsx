import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import StatusDemo from "@/registry/default/examples/status-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StatusDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
