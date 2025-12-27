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
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Pending Utility</h2>
            <PendingDemo />
            <PendingWrapperDemo />
            <PendingFormDemo />
            <PendingCustomDemo />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">Status Component</h2>
            <StatusDemo />
            <StatusVariantsDemo />
            <StatusTextOnlyDemo />
            <StatusListDemo />
          </div>
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
