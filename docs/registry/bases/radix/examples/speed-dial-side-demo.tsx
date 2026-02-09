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

const sides = ["top", "right", "left", "bottom"] as const;

export default function SpeedDialSideDemo() {
  return (
    <div className="grid grid-cols-2 gap-24">
      {sides.map((side) => (
        <div key={side} className="flex flex-col items-center gap-2">
          <span className="text-muted-foreground text-sm capitalize">
            {side}
          </span>
          <SpeedDial side={side}>
            <SpeedDialTrigger className="transition-transform duration-200 ease-out data-[state=closed]:rotate-0 data-[state=open]:rotate-135">
              <Plus />
            </SpeedDialTrigger>
            <SpeedDialContent>
              <SpeedDialItem>
                <SpeedDialLabel className="sr-only">Share</SpeedDialLabel>
                <SpeedDialAction onSelect={() => toast.success("Shared")}>
                  <Share2 />
                </SpeedDialAction>
              </SpeedDialItem>
              <SpeedDialItem>
                <SpeedDialLabel className="sr-only">Copy</SpeedDialLabel>
                <SpeedDialAction onSelect={() => toast.success("Copied")}>
                  <Copy />
                </SpeedDialAction>
              </SpeedDialItem>
              <SpeedDialItem>
                <SpeedDialLabel className="sr-only">Like</SpeedDialLabel>
                <SpeedDialAction onSelect={() => toast.success("Liked")}>
                  <Heart />
                </SpeedDialAction>
              </SpeedDialItem>
            </SpeedDialContent>
          </SpeedDial>
        </div>
      ))}
    </div>
  );
}
