"use client";

import { Demo } from "@/components/demo";
import { Shell } from "@/components/shell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ColorPickerDemo from "@/registry/default/examples/color-picker-demo";
import TimePickerDemo from "@/registry/default/examples/time-picker-demo";

export default function PlaygroundPage() {
  return (
    <Shell>
      <Demo>
        <div className="flex flex-col gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>Select a time</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent loop>
              <DropdownMenuItem>09:00</DropdownMenuItem>
              <DropdownMenuItem>10:00</DropdownMenuItem>
              <DropdownMenuItem>11:00</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input type="time" />
          <TimePickerDemo />
        </div>
        <ColorPickerDemo />
      </Demo>
    </Shell>
  );
}
