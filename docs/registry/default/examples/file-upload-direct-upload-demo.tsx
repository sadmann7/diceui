"use client";

import { Button } from "@/components/ui/button";
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
import { Upload, X } from "lucide-react";
import * as React from "react";

export default function FileUploadDirectUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);

  const onUpload = React.useCallback(
    async (
      _file: File,
      {
        onProgress,
        onSuccess,
        onError,
      }: {
        onProgress: (progress: number) => void;
        onSuccess: () => void;
        onError: (error: Error) => void;
      },
    ) => {
      try {
        // Simulate file upload with progress
        const totalChunks = 10;
        let uploadedChunks = 0;

        // Simulate chunk upload with delays
        for (let i = 0; i < totalChunks; i++) {
          // Simulate network delay (100-300ms per chunk)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.random() * 200 + 100),
          );

          // Update progress
          uploadedChunks++;
          const progress = (uploadedChunks / totalChunks) * 100;
          onProgress(progress);
        }

        // Simulate server processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        onSuccess();
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Upload failed"));
      }
    },
    [],
  );

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onUpload={onUpload}
      maxFiles={2}
      className="w-full max-w-md"
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max 2 files)
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
  );
}
