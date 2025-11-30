"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import KeyValueDemo from "@/registry/default/examples/key-value-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <KeyValueDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
