import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import CommandStackControlledBaseDemo from "@/registry/bases/base/examples/command-stack-controlled-demo";
import CommandStackBaseDemo from "@/registry/bases/base/examples/command-stack-demo";
import { Separator } from "@/registry/bases/base/ui/separator";
import CommandStackControlledRadixDemo from "@/registry/bases/radix/examples/command-stack-controlled-demo";
import CommandStackRadixDemo from "@/registry/bases/radix/examples/command-stack-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <CommandStackBaseDemo />
          <CommandStackControlledBaseDemo />
          <Separator />
          <CommandStackRadixDemo />
          <CommandStackControlledRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
