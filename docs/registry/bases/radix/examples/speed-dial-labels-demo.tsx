"use client";

import { Copy, Heart, Plus, Share2 } from "lucide-react";
import { toast } from "sonner";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialTrigger,
} from "@/registry/bases/radix/ui/speed-dial";

export default function SpeedDialLabelsDemo() {
  return (
    <SpeedDial>
      <SpeedDialTrigger className="transition-transform duration-200 ease-out data-[state=closed]:rotate-0 data-[state=open]:rotate-135">
        <Plus />
      </SpeedDialTrigger>
      <SpeedDialContent>
        <SpeedDialItem>
          <SpeedDialLabel>Share</SpeedDialLabel>
          <SpeedDialAction onSelect={() => toast.success("Shared")}>
            <Share2 />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Copy</SpeedDialLabel>
          <SpeedDialAction onSelect={() => toast.success("Copied")}>
            <Copy />
          </SpeedDialAction>
        </SpeedDialItem>
        <SpeedDialItem>
          <SpeedDialLabel>Like</SpeedDialLabel>
          <SpeedDialAction onSelect={() => toast.success("Liked")}>
            <Heart />
          </SpeedDialAction>
        </SpeedDialItem>
      </SpeedDialContent>
    </SpeedDial>
  );
}
