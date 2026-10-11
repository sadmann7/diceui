import { Demo, DemoItemGroup, DemoSeparator } from "@/components/demo";
import { Shell } from "@/components/shell";
import FacetedBaseDemo from "@/registry/bases/base/examples/faceted-demo";
import FacetedMultipleBaseDemo from "@/registry/bases/base/examples/faceted-multiple-demo";
import FacetedRadixDemo from "@/registry/bases/radix/examples/faceted-demo";
import FacetedMultipleRadixDemo from "@/registry/bases/radix/examples/faceted-multiple-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <FacetedBaseDemo />
          <FacetedMultipleBaseDemo />
          <DemoSeparator />
          <FacetedRadixDemo />
          <FacetedMultipleRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
