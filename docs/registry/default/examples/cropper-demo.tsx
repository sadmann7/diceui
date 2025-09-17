"use client";

import * as React from "react";
import {
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type Point,
} from "@/registry/default/ui/cropper";

export function CropperDemo() {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });

  return (
    <Cropper
      aspectRatio={1}
      crop={crop}
      onCropChange={setCrop}
      className="min-h-72"
    >
      <CropperContent>
        <CropperImage
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
          alt="Profile picture"
        />
        <CropperArea />
      </CropperContent>
    </Cropper>
  );
}
