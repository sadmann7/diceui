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
import { CloudUploadIcon, UploadIcon, X } from "lucide-react";
import * as React from "react";

export default function FileUploadAutoUploadDemo() {
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
        // Simulate the upload process
        const totalSteps = 10;
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise((resolve) => setTimeout(resolve, 500));
          onProgress((step / totalSteps) * 100);
        }
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
      className="w-full max-w-xl"
      multiple
    >
      <FileUploadDropzone className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed p-10">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <CloudUploadIcon className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm">Drag and drop files here</p>
            <p className="text-muted-foreground text-xs">
              Files will be uploaded automatically
            </p>
          </div>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="ghost" size="icon" className="size-7">
            <UploadIcon />
            Select files
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList>
        {files.map((file) => (
          <FileUploadItem
            key={file.name}
            value={file}
            className="flex items-center rounded-lg border p-2"
          >
            <FileUploadItemPreview className="size-10 rounded bg-muted p-2" />
            <FileUploadItemMetadata className="flex-1 px-4" />
            <FileUploadItemProgress className="w-[100px]" />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <X />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}
