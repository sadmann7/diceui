"use client";

import { Button } from "@/components/ui/button";
import { useFileUpload } from "@/hooks/use-file-upload";
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
import { Upload, X } from "lucide-react";
import * as React from "react";

export default function FileUploadUploadThingDemo() {
  const { onUpload, progresses, uploadedFiles } = useFileUpload(
    "imageUploader",
    {
      defaultFiles: [],
    },
  );

  return (
    <FileUpload
      // onUpload={onUpload}
      className="w-full max-w-md"
      maxFiles={2}
      maxSize={4 * 1024 * 1024}
      accept="image/*"
      multiple
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
      {/* <FileUploadList>
        {uploadedFiles.map((file, index) => (
          <FileUploadItem key={index} value={file}>
            <FileUploadItemPreview />
            <FileUploadItemMetadata />
            <div className="flex items-center gap-2">
              {progresses[file.name] !== undefined && (
                <FileUploadItemProgress circular />
              )}
              <FileUploadItemDelete asChild>
                <Button variant="ghost" size="icon" className="size-7">
                  <X className="size-4" />
                </Button>
              </FileUploadItemDelete>
            </div>
          </FileUploadItem>
        ))}
      </FileUploadList> */}
    </FileUpload>
  );
}
