import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import QueryBuilderBaseDemo from "@/registry/bases/base/examples/query-builder-demo";
import QueryBuilderSortableBaseDemo from "@/registry/bases/base/examples/query-builder-sortable-demo";
import QueryBuilderRadixDemo from "@/registry/bases/radix/examples/query-builder-demo";
import QueryBuilderSortableRadixDemo from "@/registry/bases/radix/examples/query-builder-sortable-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <QueryBuilderSortableBaseDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <QueryBuilderSortableRadixDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <QueryBuilderBaseDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <QueryBuilderRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
