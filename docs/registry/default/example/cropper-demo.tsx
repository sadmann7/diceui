"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  type CropArea,
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type CropShape,
  type ObjectFit,
  type Point,
  useCropper,
} from "@/registry/default/ui/cropper";

const DEMO_IMAGE =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80";

export default function CropperDemo() {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);
  const [aspect, setAspect] = React.useState(4 / 3);
  const [cropShape, setCropShape] = React.useState<CropShape>("rect");
  const [objectFit, setObjectFit] = React.useState<ObjectFit>("contain");
  const [showGrid, setShowGrid] = React.useState(true);
  const [zoomWithScroll, setZoomWithScroll] = React.useState(true);
  const [restrictPosition, setRestrictPosition] = React.useState(true);
  const [croppedAreaPixels, setCroppedAreaPixels] =
    React.useState<CropArea | null>(null);
  const [croppedAreaPercentages, setCroppedAreaPercentages] =
    React.useState<CropArea | null>(null);

  const onCropComplete = React.useCallback(
    (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
      setCroppedAreaPercentages(croppedArea);
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const onCropChange = React.useCallback((crop: Point) => {
    setCrop(crop);
  }, []);

  const onZoomChange = React.useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = React.useCallback((rotation: number) => {
    setRotation(rotation);
  }, []);

  const resetCrop = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const aspectOptions = [
    { label: "Free", value: "free" },
    { label: "1:1", value: 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "16:9", value: 16 / 9 },
    { label: "3:2", value: 3 / 2 },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Image Cropper</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-96 w-full overflow-hidden rounded-lg border">
              <Cropper
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={typeof aspect === "string" ? undefined : aspect}
                cropShape={cropShape}
                objectFit={objectFit}
                showGrid={showGrid}
                zoomWithScroll={zoomWithScroll}
                restrictPosition={restrictPosition}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onRotationChange={onRotationChange}
                onCropComplete={onCropComplete}
              >
                <CropperContent>
                  <CropperImage src={DEMO_IMAGE} alt="Crop me" />
                  <CropperArea />
                </CropperContent>
              </Cropper>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={resetCrop} variant="outline" size="sm">
                Reset
              </Button>
              <Button
                onClick={() => console.log("Cropped area:", croppedAreaPixels)}
                size="sm"
              >
                Log Crop Data
              </Button>
            </div>
          </CardContent>
        </Card>
        {(croppedAreaPercentages || croppedAreaPixels) && (
          <Card>
            <CardHeader>
              <CardTitle>Crop Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {croppedAreaPercentages && (
                <div>
                  <Label className="font-medium text-sm">Percentages</Label>
                  <pre className="mt-1 rounded bg-muted p-2 text-xs">
                    {JSON.stringify(croppedAreaPercentages, null, 2)}
                  </pre>
                </div>
              )}
              {croppedAreaPixels && (
                <div>
                  <Label className="font-medium text-sm">Pixels</Label>
                  <pre className="mt-1 rounded bg-muted p-2 text-xs">
                    {JSON.stringify(croppedAreaPixels, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Zoom: {zoom.toFixed(2)}</Label>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value ?? 1)}
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
                onValueChange={([value]) => setRotation(value ?? 0)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Aspect Ratio</Label>
              <Select
                value={typeof aspect === "string" ? "free" : aspect.toString()}
                onValueChange={(value) => {
                  if (value === "free") {
                    setAspect("free" as string & number);
                  } else {
                    setAspect(parseFloat(value));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {aspectOptions.map((option) => (
                    <SelectItem
                      key={option.label}
                      value={option.value.toString()}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Crop Shape</Label>
              <Select
                value={cropShape}
                onValueChange={(value: CropShape) => setCropShape(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rect">Rectangle</SelectItem>
                  <SelectItem value="round">Circle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Object Fit</Label>
              <Select
                value={objectFit}
                onValueChange={(value: ObjectFit) => setObjectFit(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contain">Contain</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="horizontal-cover">
                    Horizontal Cover
                  </SelectItem>
                  <SelectItem value="vertical-cover">Vertical Cover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <Label htmlFor="show-grid">Show Grid</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="zoom-scroll"
                  checked={zoomWithScroll}
                  onCheckedChange={setZoomWithScroll}
                />
                <Label htmlFor="zoom-scroll">Zoom with Scroll</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="restrict-position"
                  checked={restrictPosition}
                  onCheckedChange={setRestrictPosition}
                />
                <Label htmlFor="restrict-position">Restrict Position</Label>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Crop:</strong> x: {crop.x.toFixed(0)}, y:{" "}
              {crop.y.toFixed(0)}
            </div>
            <div>
              <strong>Zoom:</strong> {zoom.toFixed(2)}
            </div>
            <div>
              <strong>Rotation:</strong> {rotation.toFixed(0)}°
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Additional demo showing video cropping
export function VideoCropperDemo() {
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [rotation, setRotation] = React.useState(0);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Video Cropper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 w-full overflow-hidden rounded-lg border">
          <Cropper
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={16 / 9}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
          >
            <CropperContent>
              {/* Note: In a real implementation, you'd use CropperVideo with a video source */}
              <div className="flex h-full items-center justify-center bg-muted text-muted-foreground">
                Video cropping would work similarly with CropperVideo component
              </div>
              <CropperArea />
            </CropperContent>
          </Cropper>
        </div>
      </CardContent>
    </Card>
  );
}

// Simple usage example
export function SimpleCropperDemo() {
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
            cropShape="round"
            onCropChange={setCrop}
            onZoomChange={setZoom}
          >
            <CropperContent>
              <CropperImage src={DEMO_IMAGE} alt="Profile picture" />
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
