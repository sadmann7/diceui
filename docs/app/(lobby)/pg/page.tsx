"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ActionBarDemo from "@/registry/default/examples/action-bar-demo";
import ActionBarPositionDemo from "@/registry/default/examples/action-bar-position-demo";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <ActionBarDemo />
        <ActionBarPositionDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
