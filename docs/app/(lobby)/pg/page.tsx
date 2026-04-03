import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import BannerBaseDemo from "@/registry/bases/base/examples/banner-demo";
import BannerBaseStackedDemo from "@/registry/bases/base/examples/banner-stacked-demo";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";
import BannerRadixDemo from "@/registry/bases/radix/examples/banner-demo";
import BannerRadixStackedDemo from "@/registry/bases/radix/examples/banner-stacked-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <BannerBaseDemo />
          <BannerRadixDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <BannerBaseStackedDemo />
          <BannerRadixStackedDemo />
        </DemoItemGroup>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
