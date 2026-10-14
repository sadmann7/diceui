import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import CommandStackBaseDemo from "@/registry/bases/base/examples/command-stack-demo";
import CommandStackRadixDemo from "@/registry/bases/radix/examples/command-stack-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <CommandStackBaseDemo />
          <CommandStackRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
