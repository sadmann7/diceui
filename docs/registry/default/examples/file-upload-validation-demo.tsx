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
import { CloudUploadIcon, TrashIcon, UploadIcon, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

export default function FileUploadValidationDemo() {
  const [files, setFiles] = React.useState<File[]>([]);

  const onFileValidate = React.useCallback((file: File): string | undefined => {
    // Validate file type (only images)
    if (!file.type.startsWith("image/")) {
      return "Only image files are allowed";
    }

    // Validate file size (max 2MB)
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`;
    }

    return undefined;
  }, []);

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  return (
    <div className="w-full max-w-xl">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onFileValidate={onFileValidate}
        onFileReject={onFileReject}
        accept="image/*"
        maxSize={2 * 1024 * 1024} // 2MB
        maxFiles={5}
        className="w-full"
        multiple
      >
        <FileUploadDropzone className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed p-10">
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <CloudUploadIcon className="h-10 w-10 text-muted-foreground" />
            <div className="flex flex-col space-y-1">
              <p className="font-medium text-sm">Drop images here</p>
              <p className="text-muted-foreground text-xs">
                Only images less than 2MB (max 5 files)
              </p>
            </div>
          </div>
          <FileUploadTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <UploadIcon />
              Select images
            </Button>
          </FileUploadTrigger>
        </FileUploadDropzone>
        <FileUploadList className="mt-4 space-y-2">
          {files.map((file) => (
            <FileUploadItem
              key={file.name}
              value={file}
              className="flex items-center rounded-lg border p-2"
            >
              <FileUploadItemPreview />
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
    </div>
  );
}
