import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import SelectionWheelBaseDemo from "@/registry/bases/base/examples/selection-wheel-demo";
import SelectionWheelRadixDemo from "@/registry/bases/radix/examples/selection-wheel-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <SelectionWheelBaseDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <SelectionWheelRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
