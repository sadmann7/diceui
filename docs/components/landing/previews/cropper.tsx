"use client";

import * as React from "react";

import {
  Cropper,
  CropperArea,
  CropperImage,
  type CropperPoint,
} from "@/registry/bases/base/ui/cropper";

export default function CropperPreview() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);

  return (
    <div className="flex flex-1 flex-col p-5">
      <Cropper
        aspectRatio={3 / 2}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        preventScrollZoom
        className="flex-1 rounded-md"
      >
        <CropperImage src="/images/cozy.jpeg" alt="A cozy room" />
        <CropperArea />
      </Cropper>
    </div>
  );
}
