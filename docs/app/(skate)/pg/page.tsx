import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import QueryBuilderBaseDemo from "@/registry/bases/base/examples/query-builder-demo";
import QueryBuilderFilterBaseDemo from "@/registry/bases/base/examples/query-builder-filter-demo";
import QueryBuilderSqlBaseDemo from "@/registry/bases/base/examples/query-builder-sql-demo";
import QueryBuilderRadixDemo from "@/registry/bases/radix/examples/query-builder-demo";
import QueryBuilderFilterRadixDemo from "@/registry/bases/radix/examples/query-builder-filter-demo";
import QueryBuilderSqlRadixDemo from "@/registry/bases/radix/examples/query-builder-sql-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup className="w-full max-w-2xl">
          <QueryBuilderBaseDemo />
          <QueryBuilderRadixDemo />
        </DemoItemGroup>
        <DemoItemGroup className="w-full max-w-2xl">
          <QueryBuilderSqlBaseDemo />
          <QueryBuilderSqlRadixDemo />
        </DemoItemGroup>
        <DemoItemGroup className="w-full max-w-2xl">
          <QueryBuilderFilterBaseDemo />
          <QueryBuilderFilterRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
