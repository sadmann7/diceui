"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  QRCode,
  QRCodeCanvas,
  QRCodeDownload,
} from "@/registry/default/ui/qr-code";

export default function QRCodeInteractiveDemo() {
  const [value, setValue] = React.useState("https://diceui.com");
  const [size, setSize] = React.useState(200);
  const [fgColor, setFgColor] = React.useState("#000000");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [level, setLevel] = React.useState<"L" | "M" | "Q" | "H">("M");

  return (
    <div className="space-y-6 p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Customize QR Code</h3>

          <div className="space-y-2">
            <Label htmlFor="qr-value">Content</Label>
            <Input
              id="qr-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter text or URL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="qr-size">Size</Label>
              <Input
                id="qr-size"
                type="number"
                min="100"
                max="400"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qr-level">Error Correction</Label>
              <Select
                value={level}
                onValueChange={(value: "L" | "M" | "Q" | "H") =>
                  setLevel(value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Low (~7%)</SelectItem>
                  <SelectItem value="M">Medium (~15%)</SelectItem>
                  <SelectItem value="Q">Quartile (~25%)</SelectItem>
                  <SelectItem value="H">High (~30%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fg-color">Foreground Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="fg-color"
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <QRCode
              value={value}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
            >
              <QRCodeDownload format="png" filename="custom-qr">
                <Button variant="outline" size="sm">
                  Download PNG
                </Button>
              </QRCodeDownload>
            </QRCode>
            <QRCode
              value={value}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
            >
              <QRCodeDownload format="svg" filename="custom-qr">
                <Button variant="outline" size="sm">
                  Download SVG
                </Button>
              </QRCodeDownload>
            </QRCode>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="font-semibold text-lg">Preview</h3>
          <div className="rounded-lg border bg-muted/20 p-4">
            <QRCode
              value={value}
              size={size}
              fgColor={fgColor}
              bgColor={bgColor}
              level={level}
            >
              <QRCodeCanvas />
            </QRCode>
          </div>
          <p className="text-center text-muted-foreground text-sm">{value}</p>
        </div>
      </div>
    </div>
  );
}
