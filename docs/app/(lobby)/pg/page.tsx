import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import PendingCustomDemo from "@/registry/default/examples/pending-custom-demo";
import PendingDemo from "@/registry/default/examples/pending-demo";
import PendingFormDemo from "@/registry/default/examples/pending-form-demo";
import PendingWrapperDemo from "@/registry/default/examples/pending-wrapper-demo";
import StatusDemo from "@/registry/default/examples/status-demo";
import StatusListDemo from "@/registry/default/examples/status-list-demo";
import StatusTextOnlyDemo from "@/registry/default/examples/status-text-only-demo";
import StatusVariantsDemo from "@/registry/default/examples/status-variants-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div>
          <PendingDemo />
          <PendingWrapperDemo />
          <PendingFormDemo />
          <PendingCustomDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
