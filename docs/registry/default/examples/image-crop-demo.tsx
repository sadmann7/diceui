"use client";

import * as React from "react";
import * as ImageCrop from "@/registry/default/ui/image-crop";

export default function ImageCropDemo() {
  const [cropValue, setCropValue] = React.useState({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <ImageCrop.Root
        src="/placeholder.svg?height=400&width=400"
        alt="Demo image"
        value={cropValue}
        onValueChange={setCropValue}
        zoom={zoom}
        onZoomChange={setZoom}
        rotation={rotation}
        onRotationChange={setRotation}
        aspect={1}
        onCropComplete={(croppedArea, croppedAreaPixels) => {
          console.log("Crop complete:", { croppedArea, croppedAreaPixels });
        }}
      >
        <ImageCrop.CropArea />

        <ImageCrop.Controls>
          <ImageCrop.ZoomSlider />
          <ImageCrop.RotateButton direction="left" />
          <ImageCrop.RotateButton direction="right" />
          <ImageCrop.ResetButton />
          <ImageCrop.CropButton />
        </ImageCrop.Controls>
      </ImageCrop.Root>
    </div>
  );
}
