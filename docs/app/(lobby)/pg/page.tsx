"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";
import TimePickerPlaceholderDemo from "@/registry/default/examples/time-picker-placeholder-demo";
import TimePickerSecondsDemo from "@/registry/default/examples/time-picker-seconds-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-6">
          <input type="time" />
          <TimePickerDemo />
          <TimePickerSecondsDemo />
          <TimePickerPlaceholderDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
