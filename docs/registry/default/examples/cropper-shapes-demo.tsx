"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type CropperPoint,
} from "@/registry/default/ui/cropper";

const shapes = [
  { label: "Rectangular", value: "rectangular" },
  { label: "Circular", value: "circular" },
] as const;

const objectFits = [
  { label: "Contain", value: "contain" },
  { label: "Cover", value: "cover" },
  { label: "Horizontal Cover", value: "horizontal-cover" },
  { label: "Vertical Cover", value: "vertical-cover" },
] as const;

export default function CropperShapesDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [shape, setShape] = React.useState<"rectangular" | "circular">(
    "rectangular",
  );
  const [objectFit, setObjectFit] = React.useState<
    "contain" | "cover" | "horizontal-cover" | "vertical-cover"
  >("contain");
  const [withGrid, setWithGrid] = React.useState(false);
  const [allowOverflow, setAllowOverflow] = React.useState(false);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="shape">Shape:</Label>
          <Select
            value={shape}
            onValueChange={(value) =>
              setShape(value as "rectangular" | "circular")
            }
          >
            <SelectTrigger id="shape" className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {shapes.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label htmlFor="object-fit">Object Fit:</Label>
          <Select
            value={objectFit}
            onValueChange={(value) =>
              setObjectFit(
                value as
                  | "contain"
                  | "cover"
                  | "horizontal-cover"
                  | "vertical-cover",
              )
            }
          >
            <SelectTrigger id="object-fit" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {objectFits.map((fit) => (
                <SelectItem key={fit.value} value={fit.value}>
                  {fit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Switch id="grid" checked={withGrid} onCheckedChange={setWithGrid} />
          <Label htmlFor="grid">Show Grid</Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="overflow"
            checked={allowOverflow}
            onCheckedChange={setAllowOverflow}
          />
          <Label htmlFor="overflow">Allow Overflow</Label>
        </div>
      </div>

      <Cropper
        aspectRatio={1}
        crop={crop}
        zoom={zoom}
        shape={shape}
        objectFit={objectFit}
        withGrid={withGrid}
        allowOverflow={allowOverflow}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        className="min-h-80 max-w-lg"
      >
        <CropperContent>
          <CropperImage
            src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Forest landscape"
            crossOrigin="anonymous"
          />
          <CropperArea />
        </CropperContent>
      </Cropper>
    </div>
  );
}
