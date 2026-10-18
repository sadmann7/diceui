import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import QueryBuilderBaseDemo from "@/registry/bases/base/examples/query-builder-demo";
import QueryBuilderRadixDemo from "@/registry/bases/radix/examples/query-builder-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup className="w-full max-w-xl">
          <QueryBuilderRadixDemo />
          <QueryBuilderBaseDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
