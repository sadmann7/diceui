"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerContent,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/ui/color-picker";
import { Label } from "@/components/ui/label";
import { Popover } from "@/components/ui/popover";
import * as React from "react";

export default function ColorPickerCustomDemo() {
  const [primaryColor, setPrimaryColor] = React.useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = React.useState("#10b981");
  const [accentColor, setAccentColor] = React.useState("#f59e0b");

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Theme Colors</h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Primary Color */}
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <ColorPicker value={primaryColor} onValueChange={setPrimaryColor}>
              <Popover>
                <ColorPickerTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <div
                      className="mr-2 h-4 w-4 rounded"
                      style={{ backgroundColor: primaryColor }}
                    />
                    {primaryColor}
                  </Button>
                </ColorPickerTrigger>

                <ColorPickerContent>
                  <ColorPickerArea />
                  <ColorPickerHueSlider />
                  <ColorPickerAlphaSlider />
                  <ColorPickerSwatch />
                  <ColorPickerInput />
                </ColorPickerContent>
              </Popover>
            </ColorPicker>
          </div>

          {/* Secondary Color */}
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <ColorPicker
              value={secondaryColor}
              onValueChange={setSecondaryColor}
            >
              <Popover>
                <ColorPickerTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <div
                      className="mr-2 h-4 w-4 rounded"
                      style={{ backgroundColor: secondaryColor }}
                    />
                    {secondaryColor}
                  </Button>
                </ColorPickerTrigger>

                <ColorPickerContent>
                  <ColorPickerArea />
                  <ColorPickerHueSlider />
                  <ColorPickerAlphaSlider />
                  <ColorPickerSwatch />
                  <ColorPickerInput />
                </ColorPickerContent>
              </Popover>
            </ColorPicker>
          </div>

          {/* Accent Color */}
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <ColorPicker value={accentColor} onValueChange={setAccentColor}>
              <Popover>
                <ColorPickerTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <div
                      className="mr-2 h-4 w-4 rounded"
                      style={{ backgroundColor: accentColor }}
                    />
                    {accentColor}
                  </Button>
                </ColorPickerTrigger>

                <ColorPickerContent>
                  <ColorPickerArea />
                  <ColorPickerHueSlider />
                  <ColorPickerAlphaSlider />
                  <ColorPickerSwatch />
                  <ColorPickerInput />
                </ColorPickerContent>
              </Popover>
            </ColorPicker>
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <div className="space-y-4">
        <h4 className="font-medium text-base">Preview</h4>
        <div
          className="rounded-lg border p-6"
          style={{ backgroundColor: `${primaryColor}10` }}
        >
          <div className="space-y-3">
            <div
              className="h-8 rounded"
              style={{ backgroundColor: primaryColor }}
            />
            <div
              className="h-6 rounded"
              style={{ backgroundColor: secondaryColor }}
            />
            <div
              className="h-4 rounded"
              style={{ backgroundColor: accentColor }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
