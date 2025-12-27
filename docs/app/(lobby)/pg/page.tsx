import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import PendingCustomDemo from "@/registry/default/examples/pending-custom-demo";
import PendingDemo from "@/registry/default/examples/pending-demo";
import PendingFormDemo from "@/registry/default/examples/pending-form-demo";
import PendingWrapperDemo from "@/registry/default/examples/pending-wrapper-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-4">
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
