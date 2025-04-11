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
import { toast } from "sonner";

export default function FileUploadCircularProgressDemo() {
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

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      className="w-full max-w-md"
      maxFiles={10}
      maxSize={5 * 1024 * 1024}
      onUpload={onUpload}
      onFileReject={onFileReject}
      multiple
    >
      <FileUploadDropzone>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max 10 files, up to 5MB each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 w-fit">
            Browse files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList orientation="horizontal">
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="p-0">
            <FileUploadItemPreview className="size-20 [&>svg]:size-12">
              <FileUploadItemProgress circular size={40} />
            </FileUploadItemPreview>
            <FileUploadItemMetadata className="sr-only" />
            <FileUploadItemDelete asChild>
              <Button
                variant="secondary"
                size="icon"
                className="-top-1 -right-1 absolute size-5 rounded-full"
              >
                <X className="size-3" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}
