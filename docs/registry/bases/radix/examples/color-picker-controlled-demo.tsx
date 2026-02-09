"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerEyeDropper,
  ColorPickerFormatSelect,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/registry/bases/radix/ui/color-picker";

const presetColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#64748b", // gray
];

export default function ColorPickerControlledDemo() {
  const [color, setColor] = React.useState("#3b82f6");
  const [isOpen, setIsOpen] = React.useState(false);

  const onReset = React.useCallback(() => {
    setColor("#000000");
    setIsOpen(false);
  }, []);

  const onPresetSelect = React.useCallback((presetColor: string) => {
    setColor(presetColor);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <ColorPicker
          value={color}
          onValueChange={setColor}
          open={isOpen}
          onOpenChange={setIsOpen}
          defaultFormat="hex"
        >
          <ColorPickerTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <ColorPickerSwatch className="size-4" />
              Pick Color
            </Button>
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
              <ColorPickerFormatSelect />
              <ColorPickerInput />
            </div>
          </ColorPickerContent>
        </ColorPicker>

        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <h4 className="font-medium text-sm">Preset Colors</h4>
        <div className="flex flex-wrap gap-2">
          {presetColors.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className="size-8 rounded border-2 border-transparent hover:border-border focus:border-ring focus:outline-none"
              style={{ backgroundColor: presetColor }}
              onClick={() => onPresetSelect(presetColor)}
              aria-label={`Select color ${presetColor}`}
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <div>
          <span className="font-medium">Current color:</span>
          <code className="ml-2 font-mono">{color}</code>
        </div>
        <div>
          <span className="font-medium">Picker state:</span>
          <span className="ml-2">{isOpen ? "Open" : "Closed"}</span>
        </div>
      </div>
    </div>
  );
}
