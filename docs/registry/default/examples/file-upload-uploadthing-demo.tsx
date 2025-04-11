"use client";

import { Button } from "@/components/ui/button";
import { uploadFiles } from "@/lib/uploadthing";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/registry/default/ui/file-upload";
import type { UploadedFile } from "@/types";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

export default function FileUploadUploadThingDemo() {
  const [isUploading, setIsUploading] = React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<UploadedFile[]>([]);

  const onUpload = React.useCallback(
    async (
      files: File[],
      {
        onProgress,
      }: {
        onProgress: (file: File, progress: number) => void;
      },
    ) => {
      try {
        setIsUploading(true);
        const res = await uploadFiles("imageUploader", {
          files,
          onUploadProgress: ({ file, progress }) => {
            onProgress(file, progress);
          },
        });

        setUploadedFiles((prev) => (prev ? [...prev, ...res] : res));
      } catch (error) {
        setIsUploading(false);

        if (error instanceof UploadThingError) {
          const errorMessage =
            error.data && "error" in error.data
              ? error.data.error
              : "Upload failed";
          toast.error(errorMessage);
          return;
        }

        toast.error(
          error instanceof Error ? error.message : "An unknown error occurred",
        );
      } finally {
        setIsUploading(false);
      }
    },
    [],
  );

  return (
    <div className="flex flex-col gap-2">
      <FileUpload
        className="w-full max-w-md"
        accept="image/*"
        maxFiles={2}
        maxSize={4 * 1024 * 1024}
        onAccept={(files) => setFiles(files)}
        onUpload={onUpload}
        multiple
        disabled={isUploading}
      >
        <FileUploadDropzone>
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center justify-center rounded-full border p-2.5">
              <Upload className="size-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-sm">Drag & drop images here</p>
            <p className="text-muted-foreground text-xs">
              Or click to browse (max 2 files, up to 4MB each)
            </p>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="outline" size="sm" className="mt-2 w-fit">
              Browse files
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList>
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file}>
              <div className="flex w-full items-center gap-2">
                <FileUploadItemPreview />
                <FileUploadItemMetadata />
                <FileUploadItemDelete asChild>
                  <Button variant="ghost" size="icon" className="size-7">
                    <X />
                  </Button>
                </FileUploadItemDelete>
              </div>
              <FileUploadItemProgress />
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
      {uploadedFiles.length > 0 ? (
        <div className="flex flex-col gap-2">
          <p className="font-medium text-muted-foreground text-sm">
            Uploaded files
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {uploadedFiles.map((file) => (
              <div
                key={file.customId ?? file.name}
                className="relative aspect-square"
              >
                <Image
                  src={file.ufsUrl}
                  alt={file.name}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
