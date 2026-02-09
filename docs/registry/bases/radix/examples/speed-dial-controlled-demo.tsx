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
} from "@/registry/bases/radix/ui/speed-dial";

export default function SpeedDialControlledDemo() {
  const externalTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="flex items-center gap-4">
      <SpeedDial open={open} onOpenChange={setOpen}>
        <SpeedDialTrigger className="transition-transform duration-200 ease-out data-[state=closed]:rotate-0 data-[state=open]:rotate-135">
          {open ? <X /> : <Plus />}
        </SpeedDialTrigger>
        <SpeedDialContent
          onInteractOutside={(event) => {
            // Prevent closing when clicking the external trigger
            if (
              externalTriggerRef.current?.contains(
                event.detail.originalEvent.target as Node,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
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
      <Button
        ref={externalTriggerRef}
        variant="outline"
        onClick={() => setOpen(!open)}
      >
        Toggle
      </Button>
    </div>
  );
}
