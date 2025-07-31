"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { Popover } from "@/components/ui/popover";
import * as React from "react";

export default function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3b82f6");

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-muted-foreground text-sm">
        Selected color: <span className="font-mono">{color}</span>
      </div>

      <ColorPicker value={color} onValueChange={setColor}>
        <Popover>
          <ColorPickerTrigger asChild>
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
          </ColorPickerTrigger>

          <ColorPickerContent>
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
          </ColorPickerContent>
        </Popover>
      </ColorPicker>
    </div>
  );
}
