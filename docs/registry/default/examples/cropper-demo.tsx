"use client";

import * as React from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  type CropArea,
  Cropper,
  CropperArea,
  CropperContent,
  CropperImage,
  type CropperProps,
  type Point,
} from "@/registry/default/ui/cropper";

export function CropperDemo() {
  const id = React.useId();
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string | null>(
    null,
  );

  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const generateCroppedImage = React.useCallback(
    async (cropPixels: CropArea) => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          toast.error("Canvas not supported");
          return;
        }

        const image = new Image();

        image.crossOrigin = "anonymous";

        const imageUrl =
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80";

        return new Promise<void>((resolve, reject) => {
          image.onload = () => {
            try {
              canvas.width = cropPixels.width;
              canvas.height = cropPixels.height;

              ctx.drawImage(
                image,
                cropPixels.x,
                cropPixels.y,
                cropPixels.width,
                cropPixels.height,
                0,
                0,
                cropPixels.width,
                cropPixels.height,
              );

              // Convert canvas to blob and create URL
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    // Clean up previous URL
                    setCroppedImageUrl((prevUrl) => {
                      if (prevUrl) {
                        URL.revokeObjectURL(prevUrl);
                      }
                      return URL.createObjectURL(blob);
                    });
                  }
                  resolve();
                },
                "image/png",
                0.95,
              );
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Error during crop",
              );
              reject(error);
            }
          };

          image.onerror = () => {
            reject(new Error("Image load failed"));
          };

          image.src = imageUrl;
        });
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error generating cropped image",
        );
      }
    },
    [],
  );

  const onCropAreaChange: NonNullable<CropperProps["onCropAreaChange"]> =
    React.useCallback(
      (_croppedArea, croppedAreaPixels) => {
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          if (croppedAreaPixels) {
            generateCroppedImage(croppedAreaPixels);
          }
        }, 300);
      },
      [generateCroppedImage],
    );

  React.useEffect(() => {
    return () => {
      if (croppedImageUrl) {
        URL.revokeObjectURL(croppedImageUrl);
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [croppedImageUrl]);

  return (
    <div className="flex max-w-lg flex-col gap-4">
      <Cropper
        aspectRatio={1}
        crop={crop}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropAreaChange={onCropAreaChange}
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
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${id}-zoom`}>Zoom: {zoom.toFixed(2)}</Label>
        <Slider
          id={`${id}-zoom`}
          value={[zoom]}
          onValueChange={([value]) => setZoom(value ?? 1)}
          min={1}
          max={3}
          step={0.1}
        />
      </div>
      {croppedImageUrl && (
        <div className="flex flex-col gap-2">
          <h3 className="font-medium text-sm">Cropped Image Preview:</h3>
          <div className="aspect-video overflow-hidden rounded-md">
            {/* biome-ignore lint/performance/noImgElement: dynamic blob URL from canvas doesn't work well with Next.js Image optimization */}
            <img
              src={croppedImageUrl}
              alt="Cropped result"
              className="size-full"
            />
          </div>
        </div>
      )}
    </div>
  );
}
