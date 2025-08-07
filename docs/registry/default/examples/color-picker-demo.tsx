"use client";

import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelector,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import * as React from "react";

export default function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor} defaultFormat="hex">
      <ColorPickerTrigger asChild>
        <ColorPickerSwatch />
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea />
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
          <div className="flex flex-1 flex-col gap-2">
            <ColorPickerHueSlider />
            <ColorPickerAlphaSlider />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerInput />
          <ColorPickerFormatSelector />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
}
