"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import KeyValueDemo from "@/registry/default/examples/key-value-demo";
import MediaPlayerDemo from "@/registry/default/examples/media-player-demo";
import SpeedDialDemo from "@/registry/default/examples/speed-dial-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <MediaPlayerDemo />
        <SpeedDialDemo />
        <KeyValueDemo />
        <TimePickerDemo />
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
