"use client";

import { Copy, Heart, Plus, Share2 } from "lucide-react";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialTrigger,
} from "@/registry/default/ui/speed-dial";

export default function SpeedDialDemo() {
  return (
    <SpeedDial>
      <SpeedDialTrigger icon={<Plus className="size-6" />} />
      <SpeedDialContent>
        <SpeedDialAction
          icon={<Share2 className="size-4" />}
          label="Share"
          showLabel
          onClick={() => console.log({ action: "share" })}
        />
        <SpeedDialAction
          icon={<Copy className="size-4" />}
          label="Copy"
          showLabel
          onClick={() => console.log({ action: "copy" })}
        />
        <SpeedDialAction
          icon={<Heart className="size-4" />}
          label="Like"
          showLabel
          onClick={() => console.log({ action: "like" })}
        />
      </SpeedDialContent>
    </SpeedDial>
  );
}
