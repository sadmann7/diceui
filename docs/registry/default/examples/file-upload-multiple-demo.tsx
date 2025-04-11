"use client";

import { Badge } from "@/components/ui/badge";
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
} from "@/registry/default/ui/file-upload";
import { CheckCircle2Icon, Trash2Icon, UploadCloudIcon } from "lucide-react";
import * as React from "react";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

export default function FileUploadMultipleDemo() {
  const [files, setFiles] = React.useState<File[]>([]);

  const simulateUpload = React.useCallback(
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
        const stepTime = Math.random() * 200 + 100; // Random time between 100-300ms per step
        for (let step = 1; step <= totalSteps; step++) {
          await new Promise((resolve) => setTimeout(resolve, stepTime));
          onProgress((step / totalSteps) * 100);
        }
        onSuccess();
      } catch (error) {
        onError(error instanceof Error ? error : new Error("Upload failed"));
      }
    },
    [],
  );

  // Group files by type
  const filesByType = React.useMemo(() => {
    const groups: Record<string, File[]> = {};

    for (const file of files) {
      const type = file.type.split("/")[0] || "other";
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(file);
    }

    return groups;
  }, [files]);

  return (
    <div className="w-full max-w-xl">
      <FileUpload
        value={files}
        onValueChange={setFiles}
        onUpload={simulateUpload}
        multiple
        className="w-full"
      >
        <FileUploadDropzone className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border border-dashed p-8">
          <UploadCloudIcon className="h-10 w-10 text-muted-foreground" />
          <div className="space-y-2 text-center">
            <h3 className="font-medium text-base">Upload multiple files</h3>
            <p className="text-muted-foreground text-sm">
              Drag and drop files here or click to browse
            </p>
          </div>
        </FileUploadDropzone>
        {Object.entries(filesByType).map(([type, typeFiles]) => (
          <div key={type} className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="font-medium text-sm capitalize">{type} Files</h3>
              <Badge variant="outline">{typeFiles.length}</Badge>
            </div>
            <FileUploadList className="space-y-2">
              {typeFiles.map((file) => (
                <FileUploadItem
                  key={file.name}
                  value={file}
                  className="flex items-center rounded-md border border-border bg-background p-3"
                >
                  <FileUploadItemPreview className="size-10 rounded bg-muted/50 p-2" />
                  <FileUploadItemMetadata className="flex-1 px-4" />
                  <div className="flex items-center gap-2">
                    <FileUploadItemProgress className="h-1 w-[60px]" />
                    <FileUploadItemDelete asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground"
                      >
                        <Trash2Icon />
                      </Button>
                    </FileUploadItemDelete>
                  </div>
                </FileUploadItem>
              ))}
            </FileUploadList>
          </div>
        ))}
        {files.length > 0 && (
          <div className="mt-6 flex items-center justify-between rounded-md bg-muted p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2Icon className="h-5 w-5 text-primary" />
              <span className="font-medium text-sm">
                {files.length} file{files.length !== 1 ? "s" : ""} ready
              </span>
            </div>
            <span className="text-muted-foreground text-sm">
              Total size:{" "}
              {formatBytes(files.reduce((acc, file) => acc + file.size, 0))}
            </span>
          </div>
        )}
      </FileUpload>
    </div>
  );
}
