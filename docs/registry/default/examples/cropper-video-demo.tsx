"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cropper,
  CropperArea,
  type CropperPoint,
  CropperVideo,
} from "@/registry/default/ui/cropper";

const aspectRatios = [
  { label: "Square (1:1)", value: 1 },
  { label: "Portrait (4:5)", value: 4 / 5 },
  { label: "Landscape (16:9)", value: 16 / 9 },
  { label: "Cinema (21:9)", value: 21 / 9 },
] as const;

export default function CropperVideoDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [aspectRatio, setAspectRatio] = React.useState(16 / 9);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="aspect-ratio">Aspect Ratio:</Label>
          <Select
            value={aspectRatio.toString()}
            onValueChange={(value) => setAspectRatio(Number(value))}
          >
            <SelectTrigger id="aspect-ratio" className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aspectRatios.map((ratio) => (
                <SelectItem key={ratio.value} value={ratio.value.toString()}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={togglePlayback} variant="outline" size="sm">
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>

      <Cropper
        aspectRatio={aspectRatio}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        className="min-h-96 max-w-4xl"
        objectFit="cover"
        withGrid
      >
        <CropperVideo
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            if (videoRef.current && isPlaying) {
              videoRef.current.play();
            }
          }}
        />
        <CropperArea />
      </Cropper>

      <div className="text-muted-foreground text-sm">
        <p>• Drag to pan the video</p>
        <p>• Scroll to zoom in/out</p>
        <p>• Use keyboard arrows for precise positioning</p>
        <p>• Pinch on touch devices for zoom and rotation</p>
      </div>
    </div>
  );
}
