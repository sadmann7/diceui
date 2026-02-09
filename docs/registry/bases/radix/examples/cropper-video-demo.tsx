"use client";

import { PauseIcon, PlayIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Cropper,
  CropperArea,
  type CropperPoint,
  CropperVideo,
} from "@/registry/bases/radix/ui/cropper";

export default function CropperVideoDemo() {
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [isPlaying, setIsPlaying] = React.useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const onPlayToggle = React.useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const onMetadataLoaded = React.useCallback(() => {
    if (videoRef.current && isPlaying) {
      videoRef.current.play();
    }
  }, [isPlaying]);

  return (
    <div className="flex size-full flex-col gap-4">
      <Button
        size="sm"
        className="w-fit [&_svg]:fill-current"
        onClick={onPlayToggle}
      >
        {isPlaying ? (
          <>
            <PauseIcon />
            Pause
          </>
        ) : (
          <>
            <PlayIcon />
            Play
          </>
        )}
      </Button>
      <Cropper
        aspectRatio={16 / 9}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        className="h-96"
        objectFit="cover"
        withGrid
      >
        <CropperVideo
          ref={videoRef}
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          crossOrigin="anonymous"
          onLoadedMetadata={onMetadataLoaded}
        />
        <CropperArea />
      </Cropper>
    </div>
  );
}
