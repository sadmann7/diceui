"use client";

import * as React from "react";

import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
} from "@/registry/bases/base/ui/color-picker";

export default function ColorPickerPreview() {
  const [color, setColor] = React.useState("#2f6bff");

  return (
    <div className="flex flex-1 flex-col justify-center p-5">
      <ColorPicker
        value={color}
        onValueChange={setColor}
        inline
        defaultFormat="hex"
      >
        <div className="flex flex-col gap-3">
          <ColorPickerArea className="h-36" />
          <div className="flex items-center gap-2">
            <ColorPickerEyeDropper />
            <div className="flex flex-1 flex-col gap-2">
              <ColorPickerHueSlider />
              <ColorPickerAlphaSlider />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerFormatSelect />
            <ColorPickerInput />
          </div>
        </div>
      </ColorPicker>
    </div>
  );
}
