import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import StatusDemo from "@/registry/default/examples/status-demo";
import StatusListDemo from "@/registry/default/examples/status-list-demo";
import StatusTextOnlyDemo from "@/registry/default/examples/status-text-only-demo";
import StatusVariantsDemo from "@/registry/default/examples/status-variants-demo";
import UsePendingCustomDemo from "@/registry/default/examples/use-pending-custom-demo";
import UsePendingDemo from "@/registry/default/examples/use-pending-demo";
import UsePendingFormDemo from "@/registry/default/examples/use-pending-form-demo";
import UsePendingWrapperDemo from "@/registry/default/examples/use-pending-wrapper-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-lg">usePending Utility</h2>
            <UsePendingDemo />
            <UsePendingWrapperDemo />
            <UsePendingFormDemo />
            <UsePendingCustomDemo />
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
