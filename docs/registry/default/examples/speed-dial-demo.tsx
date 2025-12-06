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
      <SpeedDialTrigger>
        <Plus />
      </SpeedDialTrigger>
      <SpeedDialContent>
        <SpeedDialItem>
          <SpeedDialLabel>Share</SpeedDialLabel>
          <SpeedDialAction onClick={() => console.log({ action: "share" })}>
            <Share2 />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Copy</SpeedDialLabel>
          <SpeedDialAction onClick={() => console.log({ action: "copy" })}>
            <Copy />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Like</SpeedDialLabel>
          <SpeedDialAction onClick={() => console.log({ action: "like" })}>
            <Heart />
          </SpeedDialAction>
        </SpeedDialItem>
      </SpeedDialContent>
    </SpeedDial>
  );
}
