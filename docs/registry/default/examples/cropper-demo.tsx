"use client";

import * as React from "react";
import {
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type CropperPoint,
} from "@/registry/default/ui/cropper";

export function CropperDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);

  return (
    <Cropper
      aspectRatio={1}
      crop={crop}
      zoom={zoom}
      onCropChange={setCrop}
      onZoomChange={setZoom}
      className="min-h-72 max-w-lg"
    >
      <CropperContent>
        <CropperImage
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
          alt="Profile picture"
          crossOrigin="anonymous"
        />
        <CropperArea />
      </CropperContent>
    </Cropper>
  );
}
