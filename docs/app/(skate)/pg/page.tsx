import { Demo, DemoItemGroup } from "@/components/demo";
import { Shell } from "@/components/shell";
import CommandPaletteControlledBaseDemo from "@/registry/bases/base/examples/command-palette-controlled-demo";
import CommandPaletteBaseDemo from "@/registry/bases/base/examples/command-palette-demo";
import { Separator } from "@/registry/bases/base/ui/separator";
import CommandPaletteControlledRadixDemo from "@/registry/bases/radix/examples/command-palette-controlled-demo";
import CommandPaletteRadixDemo from "@/registry/bases/radix/examples/command-palette-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DemoItemGroup>
          <CommandPaletteBaseDemo />
          <CommandPaletteControlledBaseDemo />
          <Separator />
          <CommandPaletteRadixDemo />
          <CommandPaletteControlledRadixDemo />
        </DemoItemGroup>
      </Demo>
    </Shell>
  );
}
