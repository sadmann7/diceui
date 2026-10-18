import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import QueryBuilderBaseDemo from "@/registry/bases/base/examples/query-builder-demo";
import QueryBuilderSqlBaseDemo from "@/registry/bases/base/examples/query-builder-sql-demo";
import QueryBuilderRadixDemo from "@/registry/bases/radix/examples/query-builder-demo";
import QueryBuilderSqlRadixDemo from "@/registry/bases/radix/examples/query-builder-sql-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <QueryBuilderBaseDemo />
          <QueryBuilderRadixDemo />
        </DemoItemGroup>
        <DemoItemGroup>
          <QueryBuilderSqlBaseDemo />
          <QueryBuilderSqlRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
