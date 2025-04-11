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
import { CloudUploadIcon, FileIcon, TrashIcon, UploadIcon } from "lucide-react";
import * as React from "react";

export default function FileUploadDemo() {
  const [files, setFiles] = React.useState<File[]>([]);

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      className="w-full max-w-xl"
      multiple
    >
      <FileUploadDropzone className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed p-10">
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <CloudUploadIcon className="h-10 w-10 text-muted-foreground" />
          <div className="flex flex-col space-y-1">
            <p className="font-medium text-sm">Drag and drop files here</p>
            <p className="text-muted-foreground text-xs">
              or click to select files
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
              <Button
                variant="ghost"
                size="icon"
                className="ml-2 text-destructive"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}
