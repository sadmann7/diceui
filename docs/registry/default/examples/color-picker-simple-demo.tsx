"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { Popover } from "@/components/ui/popover";
import * as React from "react";

export default function ColorPickerSimpleDemo() {
  const [color, setColor] = React.useState("#ff6b6b");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <Popover>
        <ColorPickerTrigger asChild>
          <Button variant="outline" size="sm">
            <div
              className="mr-2 h-3 w-3 rounded"
              style={{ backgroundColor: color }}
            />
            Color
          </Button>
        </ColorPickerTrigger>

        <ColorPickerContent>
          <ColorPickerArea />
          <ColorPickerHueSlider />
          <div className="flex items-center gap-2">
            <ColorPickerSwatch className="flex-1" />
          </div>
          <ColorPickerInput />
        </ColorPickerContent>
      </Popover>
    </ColorPicker>
  );
}
