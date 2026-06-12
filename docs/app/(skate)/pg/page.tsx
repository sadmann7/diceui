import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";
import BannerRadixStackedDemo from "@/registry/bases/radix/examples/banner-stacked-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <BannerRadixStackedDemo />
        </DemoItemGroup>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
