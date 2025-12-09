"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import CropperDemo from "@/registry/default/examples/cropper-demo";
import SpeedDialDemo from "@/registry/default/examples/speed-dial-demo";
import StepperDemo from "@/registry/default/examples/stepper-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <CropperDemo />
        <StepperDemo />
        <SpeedDialDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
