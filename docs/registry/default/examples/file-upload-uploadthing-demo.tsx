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
import * as React from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

export default function FileUploadUploadThingDemo() {
  const [isUploading, setIsUploading] = React.useState(false);
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

  const convertedFiles = React.useMemo(() => {
    return uploadedFiles.map((file) => {
      return {
        name: file.name,
        size: file.size,
        type: file.type ?? "application/octet-stream",
        lastModified: file.lastModified ?? Date.now(),
        webkitRelativePath: "",
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        bytes: () => Promise.resolve(new Uint8Array()),
        slice: () => new Blob(),
        stream: () => new ReadableStream(),
        text: () => Promise.resolve(""),
      } satisfies File;
    });
  }, [uploadedFiles]);

  return (
    <FileUpload
      className="w-full max-w-md"
      accept="image/*"
      maxFiles={2}
      maxSize={4 * 1024 * 1024}
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
        {convertedFiles.map((file, index) => (
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
  );
}
