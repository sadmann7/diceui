"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  type CropArea,
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type CropperProps,
  type Point,
} from "@/registry/default/ui/cropper";

export function CropperDemo() {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = React.useState<CropArea | null>(null);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    React.useState<CropArea | null>(null);

  const onCropAreaChange: NonNullable<CropperProps["onCropAreaChange"]> =
    React.useCallback((croppedArea, croppedAreaPixels) => {
      setCroppedArea(croppedArea);
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

  const onCropComplete: NonNullable<CropperProps["onCropComplete"]> =
    React.useCallback((croppedArea) => {
      toast.success(
        <pre className="w-full">{JSON.stringify(croppedArea, null, 2)}</pre>,
      );
    }, []);

  return (
    <div className="space-y-4">
      <Cropper
        aspectRatio={1}
        crop={crop}
        onCropChange={setCrop}
        onCropAreaChange={onCropAreaChange}
        onCropComplete={onCropComplete}
        className="min-h-72 max-w-lg"
      >
        <CropperContent>
          <CropperImage
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
            alt="Profile picture"
          />
          <CropperArea />
        </CropperContent>
      </Cropper>

      {croppedArea && (
        <div className="space-y-2 text-sm">
          <div>
            <strong>Crop Area:</strong> x: {croppedArea.x.toFixed(1)}%, y:{" "}
            {croppedArea.y.toFixed(1)}%, width: {croppedArea.width.toFixed(1)}%,
            height: {croppedArea.height.toFixed(1)}%
          </div>
          {croppedAreaPixels && (
            <div>
              <strong>Pixels:</strong> x: {croppedAreaPixels.x}px, y:{" "}
              {croppedAreaPixels.y}px, width: {croppedAreaPixels.width}px,
              height: {croppedAreaPixels.height}px
            </div>
          )}
        </div>
      )}
    </div>
  );
}
