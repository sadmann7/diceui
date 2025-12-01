"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import StatDemo from "@/registry/default/examples/stat-demo";
import StatLayoutDemo from "@/registry/default/examples/stat-layout-demo";
import StatVariantsDemo from "@/registry/default/examples/stat-variants-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <StatDemo />
        <StatVariantsDemo />
        <StatLayoutDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
