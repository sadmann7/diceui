import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/bases/base/examples/color-picker-demo";
import PhoneInputDemo from "@/registry/bases/base/examples/phone-input-demo";
import SelectionToolbarDemo from "@/registry/bases/base/examples/selection-toolbar-demo";
import TimePickerDemo from "@/registry/bases/base/examples/time-picker-demo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/registry/bases/base/ui/popover";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <PhoneInputDemo />
        <Popover>
          <PopoverTrigger>Test</PopoverTrigger>
          <PopoverContent>Test Content</PopoverContent>
        </Popover>
        <SelectionToolbarDemo />
        <TimePickerDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
