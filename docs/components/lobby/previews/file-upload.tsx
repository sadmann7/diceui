"use client";

import { Upload, X } from "lucide-react";
import * as React from "react";

import { Button } from "@/registry/bases/base/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  type FileUploadProps,
  useFileUpload,
} from "@/registry/bases/base/ui/file-upload";

const onUpload: NonNullable<FileUploadProps["onUpload"]> = async (
  files,
  { onProgress, onSuccess },
) => {
  await Promise.all(
    files.map(async (file) => {
      for (let progress = 10; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 150));
        onProgress(file, progress);
      }
      onSuccess(file);
    }),
  );
};

function UploadProgress({ file }: { file: File }) {
  const status = useFileUpload((state) => state.files.get(file)?.status);

  return status === "uploading" ? <FileUploadItemProgress /> : null;
}

export default function FileUploadPreview() {
  const [files, setFiles] = React.useState<File[]>(() => [
    new File(["{}".repeat(2150)], "registry.json", {
      type: "application/json",
    }),
    new File(["//".repeat(3400)], "action-bar.tsx", { type: "text/plain" }),
  ]);

  return (
    <div className="flex flex-1 flex-col justify-center p-5">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onUpload={onUpload}
        maxFiles={5}
        multiple
        className="w-full"
      >
        <FileUploadDropzone className="py-6">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="flex items-center justify-center rounded-full border p-2">
              <Upload className="size-4 text-muted-foreground" />
            </div>
            <p className="pt-1 text-sm font-medium">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground">
              Or click to browse (max 5 files)
            </p>
          </div>
        </FileUploadDropzone>
        <FileUploadList>
          {files.slice(-2).map((file) => (
            <FileUploadItem key={file.name} value={file}>
              <FileUploadItemPreview />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <FileUploadItemMetadata size="sm" />
                <UploadProgress file={file} />
              </div>
              <FileUploadItemDelete
                render={(props) => (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    {...props}
                  >
                    <X />
                  </Button>
                )}
              />
            </FileUploadItem>
          ))}
        </FileUploadList>
      </FileUpload>
    </div>
  );
}
