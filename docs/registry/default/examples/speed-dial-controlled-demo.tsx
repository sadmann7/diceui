"use client";

import { Copy, Heart, Plus, Share2, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  SpeedDial,
  SpeedDialAction,
  SpeedDialContent,
  SpeedDialItem,
  SpeedDialLabel,
  SpeedDialTrigger,
} from "@/registry/default/ui/speed-dial";

export default function SpeedDialControlledDemo() {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <SpeedDial open={open} onOpenChange={setOpen}>
        <SpeedDialTrigger className="transition-transform duration-200 ease-out data-[state=closed]:rotate-0 data-[state=open]:rotate-135">
          {open ? <X /> : <Plus />}
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
      <Button variant="outline" onClick={() => setOpen(!open)}>
        {open ? "Close" : "Open"}
      </Button>
    </div>
  );
}
