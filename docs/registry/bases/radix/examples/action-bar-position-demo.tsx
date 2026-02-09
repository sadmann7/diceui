"use client";

import { Archive, Star, X } from "lucide-react";
import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/bases/radix/ui/action-bar";

export default function ActionBarPositionDemo() {
  const [open, setOpen] = React.useState(false);
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const [align, setAlign] = React.useState<"start" | "center" | "end">(
    "center",
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Switch id="open" checked={open} onCheckedChange={setOpen} />
        <Label htmlFor="open">Show Action Bar</Label>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="side" className="w-14">
          Side
        </Label>
        <Select
          value={side}
          onValueChange={(value) => setSide(value as "top" | "bottom")}
        >
          <SelectTrigger id="side" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="align" className="w-14">
          Align
        </Label>
        <Select
          value={align}
          onValueChange={(value) =>
            setAlign(value as "start" | "center" | "end")
          }
        >
          <SelectTrigger id="align" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ActionBar open={open} onOpenChange={setOpen} side={side} align={align}>
        <ActionBarSelection>
          3 selected
          <ActionBarSeparator />
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup>
          <ActionBarItem>
            <Star />
            Favorite
          </ActionBarItem>
          <ActionBarItem>
            <Archive />
            Archive
          </ActionBarItem>
        </ActionBarGroup>
      </ActionBar>
    </div>
  );
}
