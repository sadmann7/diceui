"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import SpeedDialDemo from "@/registry/default/examples/speed-dial-demo";
import SpeedDialLabelsDemo from "@/registry/default/examples/speed-dial-labels-demo";
import SpeedDialSideDemo from "@/registry/default/examples/speed-dial-side-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <SpeedDialDemo />
        {/* <SpeedDialLabelsDemo />
        <SpeedDialSideDemo /> */}
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
