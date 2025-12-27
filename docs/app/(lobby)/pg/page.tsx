import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import PendingDemo from "@/registry/default/examples/pending-demo";
import PendingFormDemo from "@/registry/default/examples/pending-form-demo";
import PendingLinkDemo from "@/registry/default/examples/pending-link-demo";
import PendingSwitchDemo from "@/registry/default/examples/pending-switch-demo";
import PendingWrapperDemo from "@/registry/default/examples/pending-wrapper-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-4">
          <PendingDemo />
          <PendingWrapperDemo />
          <PendingFormDemo />
          <PendingLinkDemo />
          <PendingSwitchDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
