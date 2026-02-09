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
  ColorPickerSwatch,
} from "@/registry/bases/radix/ui/color-picker";

export default function ColorPickerInlineDemo() {
  const [color, setColor] = React.useState("#f59e0b");

  return (
    <ColorPicker
      value={color}
      onValueChange={setColor}
      inline
      defaultFormat="hex"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <ColorPickerSwatch className="size-8" />
          <span className="font-medium text-sm">Selected Color</span>
        </div>
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <ColorPickerArea />
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
      </div>
    </ColorPicker>
  );
}
