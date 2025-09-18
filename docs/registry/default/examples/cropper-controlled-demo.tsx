"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Cropper,
  CropperArea,
  type CropperAreaData,
  CropperImage,
  type CropperPoint,
} from "@/registry/default/ui/cropper";

export default function CropperControlledDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [croppedArea, setCroppedArea] = React.useState<CropperAreaData | null>(
    null,
  );

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Zoom: {zoom.toFixed(2)}</Label>
            <Slider
              value={[zoom]}
              onValueChange={(value) => setZoom(value[0] ?? 1)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label>Rotation: {rotation.toFixed(0)}°</Label>
            <Slider
              value={[rotation]}
              onValueChange={(value) => setRotation(value[0] ?? 0)}
              min={-180}
              max={180}
              step={1}
              className="w-full"
            />
          </div>
          <Button onClick={resetCrop} variant="outline" className="w-full">
            Reset
          </Button>
          {croppedArea && (
            <div className="space-y-1 rounded-md border p-3 text-sm">
              <div className="font-medium">Crop Area (%):</div>
              <div>X: {croppedArea.x.toFixed(1)}%</div>
              <div>Y: {croppedArea.y.toFixed(1)}%</div>
              <div>Width: {croppedArea.width.toFixed(1)}%</div>
              <div>Height: {croppedArea.height.toFixed(1)}%</div>
            </div>
          )}
        </div>
        <Cropper
          aspectRatio={1}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropAreaChange={(area) => setCroppedArea(area)}
          className="min-h-72"
        >
          <CropperImage
            src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Landscape"
            crossOrigin="anonymous"
          />
          <CropperArea />
        </Cropper>
      </div>
    </div>
  );
}
