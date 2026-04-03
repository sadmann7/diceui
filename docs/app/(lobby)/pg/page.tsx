import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";
import BannerDemo from "@/registry/bases/radix/examples/banner-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <BannerDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
