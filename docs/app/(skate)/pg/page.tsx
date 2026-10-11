import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import FacetedBaseDemo from "@/registry/bases/base/examples/faceted-demo";
import FacetedRadixDemo from "@/registry/bases/radix/examples/faceted-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <FacetedBaseDemo />
          <FacetedRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
