"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ActionBarDemo from "@/registry/default/examples/action-bar-demo";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ActionBarDemo />
        <div className="flex flex-col gap-4">
          <input type="time" />
          <TimePickerDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
