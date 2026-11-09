import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import SelectionWheelAreaBaseDemo from "@/registry/bases/base/examples/selection-wheel-area-demo";
import SelectionWheelControlledBaseDemo from "@/registry/bases/base/examples/selection-wheel-controlled-demo";
import SelectionWheelBaseDemo from "@/registry/bases/base/examples/selection-wheel-demo";
import SelectionWheelMenuBaseDemo from "@/registry/bases/base/examples/selection-wheel-menu-demo";
import SelectionWheelNestedBaseDemo from "@/registry/bases/base/examples/selection-wheel-nested-demo";
import SelectionWheelTriggerBaseDemo from "@/registry/bases/base/examples/selection-wheel-trigger-demo";
import SelectionWheelAreaRadixDemo from "@/registry/bases/radix/examples/selection-wheel-area-demo";
import SelectionWheelControlledRadixDemo from "@/registry/bases/radix/examples/selection-wheel-controlled-demo";
import SelectionWheelRadixDemo from "@/registry/bases/radix/examples/selection-wheel-demo";
import SelectionWheelMenuRadixDemo from "@/registry/bases/radix/examples/selection-wheel-menu-demo";
import SelectionWheelNestedRadixDemo from "@/registry/bases/radix/examples/selection-wheel-nested-demo";
import SelectionWheelTriggerRadixDemo from "@/registry/bases/radix/examples/selection-wheel-trigger-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <SelectionWheelBaseDemo />
          <SelectionWheelAreaBaseDemo />
          <SelectionWheelControlledBaseDemo />
          <SelectionWheelMenuBaseDemo />
          <SelectionWheelNestedBaseDemo />
          <SelectionWheelTriggerBaseDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <SelectionWheelRadixDemo />
          <SelectionWheelAreaRadixDemo />
          <SelectionWheelControlledRadixDemo />
          <SelectionWheelMenuRadixDemo />
          <SelectionWheelNestedRadixDemo />
          <SelectionWheelTriggerRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
