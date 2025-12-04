"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <TimePickerDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
