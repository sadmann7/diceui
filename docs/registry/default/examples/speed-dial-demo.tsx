"use client";

import { Copy, Heart, Plus, Share2 } from "lucide-react";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialTrigger,
} from "@/registry/default/ui/speed-dial";

export default function SpeedDialDemo() {
  return (
    <SpeedDial>
      <SpeedDialTrigger className="transition-transform duration-200 ease-out data-[state=closed]:rotate-0 data-[state=open]:rotate-135">
        <Plus />
      </SpeedDialTrigger>
      <SpeedDialContent>
        <SpeedDialItem>
          <SpeedDialLabel>Share</SpeedDialLabel>
          <SpeedDialAction onSelect={() => console.log({ action: "share" })}>
            <Share2 />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Copy</SpeedDialLabel>
          <SpeedDialAction onSelect={() => console.log({ action: "copy" })}>
            <Copy />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Like</SpeedDialLabel>
          <SpeedDialAction onSelect={() => console.log({ action: "like" })}>
            <Heart />
          </SpeedDialAction>
        </SpeedDialItem>
      </SpeedDialContent>
    </SpeedDial>
  );
}
