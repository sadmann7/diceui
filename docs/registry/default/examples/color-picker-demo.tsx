"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerPopover,
  ColorPickerPopoverContent,
  ColorPickerPopoverTrigger,
  ColorPickerSwatch,
} from "@/components/ui/color-picker";
import * as React from "react";

export default function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPickerPopover>
        <ColorPickerPopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex h-10 w-32 items-center gap-2"
          >
            <div
              className="h-4 w-4 rounded border"
              style={{ backgroundColor: color }}
            />
            Pick Color
          </Button>
        </ColorPickerPopoverTrigger>
        <ColorPickerPopoverContent>
          <ColorPickerArea />
          <div className="flex flex-col gap-2">
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerSwatch className="flex-1" />
            <ColorPickerEyeDropper />
          </div>
          <ColorPickerInput />
        </ColorPickerPopoverContent>
      </ColorPickerPopover>
    </ColorPicker>
  );
}
