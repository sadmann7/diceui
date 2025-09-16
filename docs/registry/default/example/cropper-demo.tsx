"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type Point,
} from "@/registry/default/ui/cropper";

export function CropperDemo() {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Simple Cropper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 w-full overflow-hidden rounded-lg border">
          <Cropper
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
          >
            <CropperContent>
              <CropperImage
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
                alt="Profile picture"
              />
              <CropperArea />
            </CropperContent>
          </Cropper>
        </div>
        <div className="mt-4 space-y-2">
          <Label>Zoom: {zoom.toFixed(2)}</Label>
          <Slider
            value={[zoom]}
            onValueChange={([value]) => setZoom(value ?? 1)}
            min={1}
            max={3}
            step={0.1}
          />
        </div>
      </CardContent>
    </Card>
  );
}
