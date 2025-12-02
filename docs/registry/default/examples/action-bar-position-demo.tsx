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
import {
  ActionBar,
  ActionBarClose,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
} from "@/registry/default/ui/action-bar";

export default function ActionBarPositionDemo() {
  const [open, setOpen] = React.useState(true);
  const [side, setSide] = React.useState<"top" | "bottom">("bottom");
  const [align, setAlign] = React.useState<"start" | "center" | "end">(
    "center",
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="side">Side</Label>
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
          <Label htmlFor="align">Align</Label>
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
      </div>

      <ActionBar open={open} onOpenChange={setOpen} side={side} align={align}>
        <ActionBarSelection>
          3 selected
          <ActionBarClose>
            <X />
          </ActionBarClose>
        </ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarItem onSelect={() => setOpen(true)}>
          <Star />
          Favorite
        </ActionBarItem>
        <ActionBarSeparator />
        <ActionBarItem onSelect={() => setOpen(true)}>
          <Archive />
          Archive
        </ActionBarItem>
      </ActionBar>
    </div>
  );
}
