"use client";

import { cn } from "cn";
import * as React from "react";

import {
  SelectionWheel,
  SelectionWheelArea,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
} from "@/registry/bases/base/ui/selection-wheel";

const colors = [
  { value: "red", label: "Red", className: "bg-red-500" },
  { value: "orange", label: "Orange", className: "bg-orange-500" },
  { value: "yellow", label: "Yellow", className: "bg-yellow-400" },
  { value: "green", label: "Green", className: "bg-green-500" },
  { value: "blue", label: "Blue", className: "bg-blue-500" },
  { value: "violet", label: "Violet", className: "bg-violet-500" },
];

export default function SelectionWheelAreaDemo() {
  const [color, setColor] = React.useState("blue");

  const current = colors.find((item) => item.value === color) ?? colors[0]!;

  return (
    <SelectionWheel value={color} onValueChange={setColor} className="w-full">
      <SelectionWheelArea
        openKey="c"
        className="flex h-56 w-full flex-col items-center justify-center gap-3 border border-dashed text-sm text-muted-foreground"
      >
        <span className={cn("size-8 rounded-full", current.className)} />
        <span>Right-click, or focus and hold C</span>
      </SelectionWheelArea>
      <SelectionWheelContent aria-label="Color" size={200}>
        <SelectionWheelIndicator />
        {colors.map((item) => (
          <SelectionWheelItem
            key={item.value}
            value={item.value}
            label={item.label}
          >
            <span className={cn("size-4 rounded-full", item.className)} />
          </SelectionWheelItem>
        ))}
        <SelectionWheelLabel />
      </SelectionWheelContent>
    </SelectionWheel>
  );
}
