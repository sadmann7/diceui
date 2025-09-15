"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import * as ImageCrop from "@/registry/default/ui/image-crop";

export default function ImageCropShapesDemo() {
  const [cropValue, setCropValue] = React.useState({
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [cropShape, setCropShape] = React.useState<"rect" | "round">("rect");
  const [showGrid, setShowGrid] = React.useState(true);

  const shapes = [
    { label: "Rectangle", value: "rect" as const },
    { label: "Circle", value: "round" as const },
  ];

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="space-y-2">
            <Label>Crop Shape</Label>
            <div className="flex gap-2">
              {shapes.map((shape) => (
                <Button
                  key={shape.value}
                  variant={cropShape === shape.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCropShape(shape.value)}
                >
                  {shape.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Options</Label>
            <Button
              variant={showGrid ? "default" : "outline"}
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              {showGrid ? "Hide" : "Show"} Grid
            </Button>
          </div>
        </div>
      </div>

      <ImageCrop.Root
        src="/placeholder.svg?height=500&width=500"
        alt="Shape demo image"
        value={cropValue}
        onValueChange={setCropValue}
        zoom={zoom}
        onZoomChange={setZoom}
        rotation={rotation}
        onRotationChange={setRotation}
        aspect={1}
        cropShape={cropShape}
        showGrid={showGrid}
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

      <div className="space-y-1 text-muted-foreground text-sm">
        <p>
          <strong>Rectangle:</strong> Standard rectangular crop area with resize
          handles
        </p>
        <p>
          <strong>Circle:</strong> Circular crop area perfect for profile
          pictures
        </p>
        <p>
          <strong>Grid:</strong> Shows rule-of-thirds lines to help with
          composition
        </p>
      </div>
    </div>
  );
}
