"use client";

import { Button } from "@/components/ui/button";
import {
  ColorPicker,
  ColorPickerAlphaSlider,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerHueSlider,
  ColorPickerInput,
  ColorPickerPanel,
  ColorPickerPopover,
  ColorPickerPopoverContent,
  ColorPickerPopoverTrigger,
  ColorPickerSwatch,
} from "@/components/ui/color-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as React from "react";

export default function ColorPickerInlineDemo() {
  const [popoverColor, setPopoverColor] = React.useState("#3b82f6");
  const [inlineColor, setInlineColor] = React.useState("#ef4444");

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Tabs defaultValue="inline" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="inline">Inline Usage</TabsTrigger>
          <TabsTrigger value="popover">Popover Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="inline" className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Inline Color Picker</h3>
            <p className="text-muted-foreground text-sm">
              Use the color picker directly without any popover wrapper. Perfect
              for forms, settings panels, or when you want the picker always
              visible.
            </p>
            <div className="text-muted-foreground text-sm">
              Selected color: <span className="font-mono">{inlineColor}</span>
            </div>
          </div>

          <ColorPicker value={inlineColor} onValueChange={setInlineColor}>
            <div className="w-fit rounded-lg border p-4">
              <ColorPickerPanel>
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
              </ColorPickerPanel>
            </div>
          </ColorPicker>
        </TabsContent>

        <TabsContent value="popover" className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Popover Color Picker</h3>
            <p className="text-muted-foreground text-sm">
              Traditional popover usage with self-contained components. No need
              to import external Popover - everything is included! Great for
              toolbars, compact interfaces, or when screen space is limited.
            </p>
            <div className="text-muted-foreground text-sm">
              Selected color: <span className="font-mono">{popoverColor}</span>
            </div>
          </div>

          <div className="flex justify-center">
            <ColorPicker value={popoverColor} onValueChange={setPopoverColor}>
              <ColorPickerPopover>
                <ColorPickerPopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex h-10 w-32 items-center gap-2"
                  >
                    <div
                      className="h-4 w-4 rounded border"
                      style={{ backgroundColor: popoverColor }}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
