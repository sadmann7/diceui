import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import StatusDemo from "@/registry/default/examples/status-demo";
import StatusListDemo from "@/registry/default/examples/status-list-demo";
import StatusTextOnlyDemo from "@/registry/default/examples/status-text-only-demo";
import StatusVariantsDemo from "@/registry/default/examples/status-variants-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StatusDemo />
        <StatusVariantsDemo />
        <StatusTextOnlyDemo />
        <StatusListDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
