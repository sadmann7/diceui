import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import PhoneInputDemo from "@/registry/default/examples/phone-input-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <PhoneInputDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
