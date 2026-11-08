"use client";

import { Circle, Eraser, Highlighter, Pen, Square, Type } from "lucide-react";
import * as React from "react";

import {
  SelectionWheel,
  SelectionWheelContent,
  SelectionWheelIndicator,
  SelectionWheelItem,
  SelectionWheelLabel,
  SelectionWheelTrigger,
} from "@/registry/bases/radix/ui/selection-wheel";

const tools = [
  { value: "pen", label: "Pen", icon: Pen },
  { value: "highlighter", label: "Highlighter", icon: Highlighter },
  { value: "eraser", label: "Eraser", icon: Eraser },
  { value: "text", label: "Text", icon: Type },
  { value: "rectangle", label: "Rectangle", icon: Square },
  { value: "ellipse", label: "Ellipse", icon: Circle },
];

export default function SelectionWheelTriggerDemo() {
  const [tool, setTool] = React.useState("pen");

  const current = tools.find((item) => item.value === tool) ?? tools[0]!;

  return (
    <SelectionWheel value={tool} onValueChange={setTool}>
      <SelectionWheelTrigger variant="outline">
        <current.icon />
        {current.label}
      </SelectionWheelTrigger>
      <SelectionWheelContent aria-label="Tool" size={220}>
        <SelectionWheelIndicator />
        {tools.map((item) => (
          <SelectionWheelItem
            key={item.value}
            value={item.value}
            label={item.label}
          >
            <item.icon />
          </SelectionWheelItem>
        ))}
        <SelectionWheelLabel />
      </SelectionWheelContent>
    </SelectionWheel>
  );
}
