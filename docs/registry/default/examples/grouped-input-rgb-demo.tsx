"use client";

import { cn } from "@/lib/utils";
import { GroupedInput } from "@/registry/default/ui/grouped-input";
import * as React from "react";

export default function GroupedInputRgbDemo() {
  const [rgb, setRgb] = React.useState({
    r: 255,
    g: 128,
    b: 0,
  });

  const onChannelChange =
    (channel: keyof typeof rgb) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(event.target.value, 10);
      if (!Number.isNaN(value) && value >= 0 && value <= 255) {
        setRgb((prev) => ({
          ...prev,
          [channel]: value,
        }));
      }
    };

  const colorPreview = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="font-medium text-sm">RGB Color</label>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-0">
            <GroupedInput
              position="first"
              placeholder="255"
              value={rgb.r}
              onChange={onChannelChange("r")}
              className="w-16"
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              aria-label="Red channel (0-255)"
            />
            <GroupedInput
              position="middle"
              placeholder="128"
              value={rgb.g}
              onChange={onChannelChange("g")}
              className="w-16"
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              aria-label="Green channel (0-255)"
            />
            <GroupedInput
              position="last"
              placeholder="0"
              value={rgb.b}
              onChange={onChannelChange("b")}
              className="w-16"
              inputMode="numeric"
              pattern="[0-9]*"
              min="0"
              max="255"
              aria-label="Blue channel (0-255)"
            />
          </div>
          <div
            className={cn("size-8 rounded-sm border shadow-sm")}
            style={{ backgroundColor: colorPreview }}
            aria-label={`Color preview: ${colorPreview}`}
          />
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Current color:{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
          {colorPreview}
        </code>
      </p>
    </div>
  );
}
