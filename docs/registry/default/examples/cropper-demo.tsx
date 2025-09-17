"use client";

import * as React from "react";
import { toast } from "sonner";
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
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 });
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string | null>(
    null,
  );

  const debounceTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const generateCroppedImage = React.useCallback(
    async (cropPixels: CropArea) => {
      try {
        // Create a canvas to perform the crop
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("Canvas not supported");
          return;
        }

        // Create an image element
        const img = new Image();

        // Handle CORS for external images
        img.crossOrigin = "anonymous";

        const imageUrl =
          "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80";

        return new Promise<void>((resolve, reject) => {
          img.onload = () => {
            try {
              // Set canvas dimensions to the crop size
              canvas.width = cropPixels.width;
              canvas.height = cropPixels.height;

              // Draw the cropped portion of the image
              ctx.drawImage(
                img,
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
              console.error("Error during crop:", error);
              reject(error);
            }
          };

          img.onerror = () => {
            reject(new Error("Image load failed"));
          };

          img.src = imageUrl;
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
        // Debounce the crop generation to avoid excessive calls during dragging
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = setTimeout(() => {
          if (croppedAreaPixels) {
            generateCroppedImage(croppedAreaPixels);
          }
        }, 300); // 300ms debounce
      },
      [generateCroppedImage],
    );

  // Clean up blob URL and timeout on unmount
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
        onCropChange={setCrop}
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
