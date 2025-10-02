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
  type QRCodeProps,
} from "@/registry/default/ui/qr-code";

export default function QRCodeInteractiveDemo() {
  const [value, setValue] = React.useState("https://diceui.com");
  const [size, setSize] = React.useState(200);
  const [foregroundColor, setForegroundColor] = React.useState("#000000");
  const [backgroundColor, setBackgroundColor] = React.useState("#ffffff");
  const [level, setLevel] = React.useState<"L" | "M" | "Q" | "H">("M");

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <h3 className="font-semibold text-lg">Customize QR Code</h3>

          <div className="flex flex-col gap-2">
            <Label htmlFor="qr-value">Content</Label>
            <Input
              id="qr-value"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="Enter text or URL"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-size">Size</Label>
              <Input
                id="qr-size"
                type="number"
                min="100"
                max="400"
                value={size}
                onChange={(event) => setSize(Number(event.target.value))}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="qr-level">Error Correction</Label>
              <Select
                value={level}
                onValueChange={(value: NonNullable<QRCodeProps["level"]>) =>
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
            <div className="flex flex-col gap-2">
              <Label htmlFor="fg-color">Foreground Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="fg-color"
                  type="color"
                  value={foregroundColor}
                  onChange={(event) => setForegroundColor(event.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  value={foregroundColor}
                  onChange={(event) => setForegroundColor(event.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="h-10 w-16"
                />
                <Input
                  value={backgroundColor}
                  onChange={(event) => setBackgroundColor(event.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <QRCode
              value={value}
              size={size}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
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
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
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

        <div className="flex flex-col items-center gap-4">
          <h3 className="font-semibold text-lg">Preview</h3>
          <div className="rounded-lg border bg-muted/20 p-4">
            <QRCode
              value={value}
              size={size}
              foregroundColor={foregroundColor}
              backgroundColor={backgroundColor}
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
