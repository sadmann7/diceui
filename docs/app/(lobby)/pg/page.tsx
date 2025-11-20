import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimelineAlternateDemo from "@/registry/default/examples/timeline-alternate-demo";
import TimelineDemo from "@/registry/default/examples/timeline-demo";
import TimelineHorizontalDemo from "@/registry/default/examples/timeline-horizontal-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TimelineDemo />
        <TimelineHorizontalDemo />
        <TimelineAlternateDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
