"use client";

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
import * as React from "react";

export default function ColorPickerDemo() {
  const [color, setColor] = React.useState("#3b82f6");

  return (
    <ColorPicker value={color} onValueChange={setColor}>
      <ColorPickerTrigger asChild>
        <ColorPickerSwatch />
      </ColorPickerTrigger>
      <ColorPickerContent>
        <ColorPickerArea />
        <div className="flex flex-col gap-2">
          <ColorPickerHueSlider />
          <ColorPickerAlphaSlider />
        </div>
        <div className="flex items-center gap-2">
          <ColorPickerEyeDropper />
        </div>
        <ColorPickerInput />
      </ColorPickerContent>
    </ColorPicker>
  );
}
