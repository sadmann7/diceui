"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import StatDemo from "@/registry/default/examples/stat-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StatDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
