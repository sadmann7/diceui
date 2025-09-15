"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as ImageCrop from "@/registry/default/ui/image-crop";

export default function ImageCropControlledDemo() {
  const [src, setSrc] = React.useState("/placeholder.svg?height=600&width=800");
  const [cropValue, setCropValue] = React.useState({
    x: 20,
    y: 20,
    width: 60,
    height: 60,
  });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [aspect, setAspect] = React.useState(1);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSrc(url);
    }
  };

  const presetAspects = [
    { label: "Square", value: 1 },
    { label: "16:9", value: 16 / 9 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:2", value: 3 / 2 },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Aspect Ratio</Label>
            <div className="flex gap-2">
              {presetAspects.map((preset) => (
                <Button
                  key={preset.label}
                  variant={aspect === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAspect(preset.value)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <Label>X: {cropValue.x.toFixed(1)}%</Label>
          </div>
          <div>
            <Label>Y: {cropValue.y.toFixed(1)}%</Label>
          </div>
          <div>
            <Label>Width: {cropValue.width.toFixed(1)}%</Label>
          </div>
          <div>
            <Label>Height: {cropValue.height.toFixed(1)}%</Label>
          </div>
          <div>
            <Label>Zoom: {zoom.toFixed(2)}x</Label>
          </div>
          <div>
            <Label>Rotation: {rotation}°</Label>
          </div>
        </div>
      </div>

      <ImageCrop.Root
        src={src}
        alt="Controlled crop demo"
        value={cropValue}
        onValueChange={setCropValue}
        zoom={zoom}
        onZoomChange={setZoom}
        rotation={rotation}
        onRotationChange={setRotation}
        aspect={aspect}
        onCropComplete={(croppedArea, croppedAreaPixels) => {
          console.log("Crop complete:", { croppedArea, croppedAreaPixels });
        }}
        onMediaLoaded={(mediaSize) => {
          console.log("Media loaded:", mediaSize);
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
