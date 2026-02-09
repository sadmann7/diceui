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
  CropperImage,
  type CropperObjectFit,
  type CropperPoint,
  type CropperProps,
  type CropperShape,
} from "@/registry/bases/radix/ui/cropper";

const shapes: { label: string; value: CropperShape }[] = [
  { label: "Rectangle", value: "rectangle" },
  { label: "Circle", value: "circle" },
] as const;

const objectFits: { label: string; value: CropperObjectFit }[] = [
  { label: "Contain", value: "contain" },
  { label: "Cover", value: "cover" },
  { label: "Horizontal Cover", value: "horizontal-cover" },
  { label: "Vertical Cover", value: "vertical-cover" },
] as const;

export default function CropperShapesDemo() {
  const id = React.useId();
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [shape, setShape] =
    React.useState<NonNullable<CropperShape>>("rectangle");
  const [objectFit, setObjectFit] =
    React.useState<NonNullable<CropperObjectFit>>("contain");
  const [withGrid, setWithGrid] = React.useState(false);
  const [allowOverflow, setAllowOverflow] = React.useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${id}-shape`}>Shape:</Label>
          <Select
            value={shape}
            onValueChange={(value: CropperShape) => setShape(value)}
          >
            <SelectTrigger id={`${id}-shape`} size="sm" className="w-32">
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
          <Label htmlFor={`${id}-object-fit`}>Object Fit:</Label>
          <Select
            value={objectFit}
            onValueChange={(value: CropperObjectFit) => setObjectFit(value)}
          >
            <SelectTrigger id={`${id}-object-fit`} size="sm" className="w-36">
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
          <Switch
            id={`${id}-grid`}
            checked={withGrid}
            onCheckedChange={setWithGrid}
          />
          <Label htmlFor={`${id}-grid`}>Show Grid</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-overflow`}
            checked={allowOverflow}
            onCheckedChange={setAllowOverflow}
          />
          <Label htmlFor={`${id}-overflow`}>Allow Overflow</Label>
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
        className="min-h-72"
      >
        <CropperImage
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
          alt="Forest landscape"
          crossOrigin="anonymous"
        />
        <CropperArea />
      </Cropper>
    </div>
  );
}
