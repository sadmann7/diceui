import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import SelectionToolbarDemo from "@/registry/default/examples/selection-toolbar-demo";
import SelectionToolbarInfoDemo from "@/registry/default/examples/selection-toolbar-info-demo";
import SwapAnimationsDemo from "@/registry/default/examples/swap-animations-demo";
import SwapDemo from "@/registry/default/examples/swap-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <SwapDemo />
        <SwapAnimationsDemo />
        <SelectionToolbarDemo />
        <Button>Do a kickflip</Button>
        <SelectionToolbarInfoDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
