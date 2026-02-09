"use client";

import { CropIcon, UploadIcon, XIcon } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
} from "@/registry/bases/radix/ui/cropper";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/registry/bases/radix/ui/file-upload";

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

  const selectedImageUrl = React.useMemo(() => {
    if (!selectedFile) return null;
    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  React.useEffect(() => {
    return () => {
      if (selectedImageUrl) {
        URL.revokeObjectURL(selectedImageUrl);
      }
    };
  }, [selectedImageUrl]);

  const onFilesChange = React.useCallback((newFiles: File[]) => {
    setFiles(newFiles);

    setFilesWithCrops((prevFilesWithCrops) => {
      const updatedFilesWithCrops = new Map(prevFilesWithCrops);

      for (const file of newFiles) {
        if (!updatedFilesWithCrops.has(file.name)) {
          updatedFilesWithCrops.set(file.name, { original: file });
        }
      }

      const fileNames = new Set(newFiles.map((f) => f.name));
      for (const [fileName] of updatedFilesWithCrops) {
        if (!fileNames.has(fileName)) {
          updatedFilesWithCrops.delete(fileName);
        }
      }

      return updatedFilesWithCrops;
    });
  }, []);

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

  const onCropAreaChange: NonNullable<CropperProps["onCropAreaChange"]> =
    React.useCallback((_, croppedAreaPixels) => {
      setCroppedArea(croppedAreaPixels);
    }, []);

  const onCropComplete: NonNullable<CropperProps["onCropComplete"]> =
    React.useCallback((_, croppedAreaPixels) => {
      setCroppedArea(croppedAreaPixels);
    }, []);

  const onCropReset = React.useCallback(() => {
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

  const onCropApply = React.useCallback(async () => {
    if (!selectedFile || !croppedArea || !selectedImageUrl) return;

    try {
      const croppedFile = await createCroppedImage(
        selectedImageUrl,
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

      onCropDialogOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to crop image",
      );
    }
  }, [
    selectedFile,
    croppedArea,
    selectedImageUrl,
    filesWithCrops,
    onCropDialogOpenChange,
  ]);

  return (
    <FileUpload
      value={files}
      onValueChange={onFilesChange}
      accept="image/*"
      maxFiles={2}
      maxSize={10 * 1024 * 1024}
      multiple
      className="w-full max-w-lg"
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
                    {selectedFile && selectedImageUrl && (
                      <div className="flex flex-col gap-4">
                        <Cropper
                          aspectRatio={1}
                          shape="circle"
                          crop={crop}
                          onCropChange={setCrop}
                          zoom={zoom}
                          onZoomChange={setZoom}
                          onCropAreaChange={onCropAreaChange}
                          onCropComplete={onCropComplete}
                          className="h-96"
                        >
                          <CropperImage
                            src={selectedImageUrl}
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
                      <Button onClick={onCropReset} variant="outline">
                        Reset
                      </Button>
                      <Button onClick={onCropApply} disabled={!croppedArea}>
                        Crop
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <FileUploadItemDelete asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 hover:bg-destructive/30 hover:text-destructive-foreground dark:hover:bg-destructive dark:hover:text-destructive-foreground"
                  >
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
