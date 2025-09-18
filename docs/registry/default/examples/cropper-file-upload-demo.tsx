"use client";

import { CropIcon, UploadIcon, XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Cropper,
  CropperArea,
  type CropperAreaData,
  CropperImage,
  type CropperPoint,
  type CropperProps,
} from "@/registry/default/ui/cropper";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/registry/default/ui/file-upload";

async function createCroppedImage(
  imageSrc: string,
  cropData: CropperAreaData,
  fileName: string,
): Promise<File> {
  const image = new Image();
  image.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = cropData.width;
      canvas.height = cropData.height;

      ctx.drawImage(
        image,
        cropData.x,
        cropData.y,
        cropData.width,
        cropData.height,
        0,
        0,
        cropData.width,
        cropData.height,
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Canvas is empty"));
          return;
        }

        const croppedFile = new File([blob], `cropped-${fileName}`, {
          type: "image/png",
        });
        resolve(croppedFile);
      }, "image/png");
    };

    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = imageSrc;
  });
}

interface FileWithCrop {
  original: File;
  cropped?: File;
}

export default function CropperFileUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [filesWithCrops, setFilesWithCrops] = React.useState<
    Map<string, FileWithCrop>
  >(new Map());
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 });
  const [zoom, setZoom] = React.useState(1);
  const [croppedArea, setCroppedArea] = React.useState<CropperAreaData | null>(
    null,
  );
  const [showCropDialog, setShowCropDialog] = React.useState(false);

  const imageUrl = React.useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  React.useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Update filesWithCrops when files change
  React.useEffect(() => {
    setFilesWithCrops((prevFilesWithCrops) => {
      const newFilesWithCrops = new Map(prevFilesWithCrops);

      // Add new files
      for (const file of files) {
        if (!newFilesWithCrops.has(file.name)) {
          newFilesWithCrops.set(file.name, { original: file });
        }
      }

      // Remove deleted files
      const fileNames = new Set(files.map((f) => f.name));
      for (const [fileName] of newFilesWithCrops) {
        if (!fileNames.has(fileName)) {
          newFilesWithCrops.delete(fileName);
        }
      }

      return newFilesWithCrops;
    });
  }, [files]);

  const onFileSelect = React.useCallback(
    (file: File) => {
      const fileWithCrop = filesWithCrops.get(file.name);
      const originalFile = fileWithCrop?.original ?? file;

      setSelectedFile(originalFile);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
      setShowCropDialog(true);
    },
    [filesWithCrops],
  );

  const onCropComplete: NonNullable<CropperProps["onCropComplete"]> =
    React.useCallback((_, croppedAreaPixels) => {
      setCroppedArea(croppedAreaPixels);
    }, []);

  const resetCrop = React.useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
  }, []);

  const onCropDialogOpenChange = React.useCallback((open: boolean) => {
    if (!open) {
      setShowCropDialog(false);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedArea(null);
    }
  }, []);

  const onApplyCrop = React.useCallback(async () => {
    if (!selectedFile || !croppedArea || !imageUrl) return;

    try {
      const croppedFile = await createCroppedImage(
        imageUrl,
        croppedArea,
        selectedFile.name,
      );

      const newFilesWithCrops = new Map(filesWithCrops);
      const existing = newFilesWithCrops.get(selectedFile.name);
      if (existing) {
        newFilesWithCrops.set(selectedFile.name, {
          ...existing,
          cropped: croppedFile,
        });
        setFilesWithCrops(newFilesWithCrops);
      }

      setShowCropDialog(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to crop image",
      );
    }
  }, [selectedFile, croppedArea, imageUrl, filesWithCrops]);

  console.log({ croppedArea });

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      accept="image/*"
      maxFiles={5}
      maxSize={10 * 1024 * 1024}
      multiple
      className="w-full"
    >
      <FileUploadDropzone className="min-h-32">
        <div className="flex flex-col items-center gap-2 text-center">
          <UploadIcon className="size-8 text-muted-foreground" />
          <div>
            <p className="font-medium text-sm">
              Drop images here or click to upload
            </p>
            <p className="text-muted-foreground text-xs">
              PNG, JPG, WebP up to 10MB
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm">
              Choose Files
            </Button>
          </FileUploadTrigger>
        </div>
      </FileUploadDropzone>
      <FileUploadList className="max-h-96 overflow-y-auto">
        {files.map((file) => {
          const fileWithCrop = filesWithCrops.get(file.name);

          return (
            <FileUploadItem key={file.name} value={file}>
              <FileUploadItemPreview
                render={(originalFile, fallback) => {
                  if (
                    fileWithCrop?.cropped &&
                    originalFile.type.startsWith("image/")
                  ) {
                    const url = URL.createObjectURL(fileWithCrop.cropped);
                    return (
                      // biome-ignore lint/performance/noImgElement: dynamic cropped file URLs from user uploads don't work well with Next.js Image optimization
                      <img
                        src={url}
                        alt={originalFile.name}
                        className="size-full object-cover"
                      />
                    );
                  }

                  return fallback();
                }}
              />
              <FileUploadItemMetadata />
              <div className="flex gap-1">
                <Dialog
                  open={showCropDialog}
                  onOpenChange={onCropDialogOpenChange}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => onFileSelect(file)}
                    >
                      <CropIcon />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>Crop Image</DialogTitle>
                      <DialogDescription>
                        Adjust the crop area and zoom level for{" "}
                        {selectedFile?.name}
                      </DialogDescription>
                    </DialogHeader>
                    {selectedFile && imageUrl && (
                      <div className="flex flex-col gap-4">
                        <Cropper
                          aspectRatio={1}
                          crop={crop}
                          zoom={zoom}
                          onCropChange={setCrop}
                          onZoomChange={setZoom}
                          onCropComplete={onCropComplete}
                          className="h-96"
                          shape="circular"
                        >
                          <CropperImage
                            src={imageUrl}
                            alt={selectedFile.name}
                            crossOrigin="anonymous"
                          />
                          <CropperArea />
                        </Cropper>
                        <div className="flex flex-col gap-2">
                          <Label className="text-sm">
                            Zoom: {zoom.toFixed(2)}
                          </Label>
                          <Slider
                            value={[zoom]}
                            onValueChange={(value) => setZoom(value[0] ?? 1)}
                            min={1}
                            max={3}
                            step={0.1}
                            className="w-full"
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                      </DialogClose>
                      <Button onClick={resetCrop} variant="outline">
                        Reset
                      </Button>
                      <Button onClick={onApplyCrop} disabled={!croppedArea}>
                        Apply Crop
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <XIcon />
                  </Button>
                </FileUploadItemDelete>
              </div>
            </FileUploadItem>
          );
        })}
      </FileUploadList>
    </FileUpload>
  );
}
