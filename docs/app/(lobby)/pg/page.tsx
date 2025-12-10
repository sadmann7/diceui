"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import DataGridDemo from "@/registry/default/examples/data-grid-demo";
import SpeedDialControlledDemo from "@/registry/default/examples/speed-dial-controlled-demo";
import SpeedDialDemo from "@/registry/default/examples/speed-dial-demo";
import SpeedDialSideDemo from "@/registry/default/examples/speed-dial-side-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <DataGridDemo />
        <SpeedDialDemo />
        <SpeedDialControlledDemo />
        <SpeedDialSideDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
