import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";
import ResponsiveDialogDemoBase from "@/registry/bases/base/examples/responsive-dialog-demo";
import ResponsiveDialogDemoRadix from "@/registry/bases/radix/examples/responsive-dialog-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ResponsiveDialogDemoBase />
        <ResponsiveDialogDemoRadix />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
