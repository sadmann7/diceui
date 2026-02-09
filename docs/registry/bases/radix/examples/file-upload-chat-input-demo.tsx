"use client";

import { ArrowUp, Paperclip, Upload, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  FileUploadTrigger,
} from "@/registry/bases/radix/ui/file-upload";

export default function FileUploadChatInputDemo() {
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const onUpload: NonNullable<FileUploadProps["onUpload"]> = React.useCallback(
    async (files, { onProgress, onSuccess, onError }) => {
      try {
        setIsUploading(true);
        // Process each file individually
        const uploadPromises = files.map(async (file) => {
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

              // Update progress for this specific file
              uploadedChunks++;
              const progress = (uploadedChunks / totalChunks) * 100;
              onProgress(file, progress);
            }

            // Simulate server processing delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            onSuccess(file);
          } catch (error) {
            onError(
              file,
              error instanceof Error ? error : new Error("Upload failed"),
            );
          } finally {
            setIsUploading(false);
          }
        });

        // Wait for all uploads to complete
        await Promise.all(uploadPromises);
      } catch (error) {
        // This handles any error that might occur outside the individual upload processes
        console.error("Unexpected error during upload:", error);
      }
    },
    [],
  );

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setInput("");
      setFiles([]);
    },
    [],
  );

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onUpload={onUpload}
      onFileReject={onFileReject}
      maxFiles={10}
      maxSize={5 * 1024 * 1024}
      className="relative h-[400px] w-full items-center p-8"
      multiple
      disabled={isUploading}
    >
      <FileUploadDropzone
        tabIndex={-1}
        // Prevents the dropzone from triggering on click
        onClick={(event) => event.preventDefault()}
        className="absolute top-0 left-0 z-0 flex size-full items-center justify-center rounded-none border-none bg-background/50 p-0 opacity-0 backdrop-blur transition-opacity duration-200 ease-out data-[dragging]:z-10 data-[dragging]:opacity-100"
      >
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Upload max 5 files each up to 5MB
          </p>
        </div>
      </FileUploadDropzone>
      <form
        onSubmit={onSubmit}
        className="relative flex w-full max-w-md flex-col gap-2.5 rounded-md border border-input px-3 py-2 outline-none focus-within:ring-1 focus-within:ring-ring/50"
      >
        <FileUploadList
          orientation="horizontal"
          className="overflow-x-auto px-0 py-1"
        >
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="max-w-52 p-1.5">
              <FileUploadItemPreview className="size-8 [&>svg]:size-5">
                <FileUploadItemProgress variant="fill" />
              </FileUploadItemPreview>
              <FileUploadItemMetadata size="sm" />
              <FileUploadItemDelete asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -top-1 -right-1 size-4 shrink-0 cursor-pointer rounded-full"
                >
                  <X className="size-2.5" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
        <Textarea
          value={input}
          onChange={onInputChange}
          placeholder="Type your message here..."
          className="field-sizing-content min-h-10 w-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          disabled={isUploading}
        />
        <div className="flex items-center justify-end gap-1.5">
          <FileUploadTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 rounded-sm"
            >
              <Paperclip className="size-3.5" />
              <span className="sr-only">Attach file</span>
            </Button>
          </FileUploadTrigger>
          <Button
            size="icon"
            className="size-7 rounded-sm"
            disabled={!input.trim() || isUploading}
          >
            <ArrowUp className="size-3.5" />
            <span className="sr-only">Send message</span>
          </Button>
        </div>
      </form>
    </FileUpload>
  );
}
