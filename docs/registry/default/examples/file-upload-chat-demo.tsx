"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { uploadFiles } from "@/lib/uploadthing"; // Assuming this path is correct
import {
  FileUpload,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadItemProgress,
  FileUploadList,
  FileUploadTrigger,
} from "@/registry/default/ui/file-upload";
import { ArrowUp, Paperclip, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";
import { UploadThingError } from "uploadthing/server";

export default function FileUploadChatDemo() {
  const [input, setInput] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [isUploading, setIsUploading] = React.useState(false);

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(event.target.value);
    },
    [],
  );

  const onUpload = React.useCallback(
    async (
      acceptedFiles: File[],
      {
        onProgress,
      }: {
        onProgress: (file: File, progress: number) => void;
      },
    ) => {
      try {
        setIsUploading(true);
        const res = await uploadFiles("imageUploader", {
          files: acceptedFiles,
          onUploadProgress: ({ file, progress }) => {
            const targetFile = file instanceof File ? file : new File([], file);
            onProgress(targetFile, progress);
          },
        });

        toast.success("Uploaded files:", {
          description: (
            <pre className="mt-2 w-80 rounded-md bg-accent/30 p-4 text-accent-foreground">
              <code>
                {JSON.stringify(
                  res.map((file) =>
                    file.name.length > 25
                      ? `${file.name.slice(0, 25)}...`
                      : file.name,
                  ),
                  null,
                  2,
                )}
              </code>
            </pre>
          ),
        });
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

  const onFileReject = React.useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
    });
  }, []);

  const onSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      console.log({ input, files });
      setInput("");
      setFiles([]);
    },
    [input, files],
  );

  return (
    <FileUpload
      value={files}
      onValueChange={setFiles}
      onUpload={onUpload}
      onFileReject={onFileReject}
      maxFiles={5}
      maxSize={5 * 1024 * 1024}
      className="relative w-full"
      disabled={isUploading}
      multiple
    >
      {/* <FileUploadDropzone className="absolute top-0 left-0 z-20 size-full border-none">
        <div className="flex flex-col items-center gap-1 text-center">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop files here</p>
          <p className="text-muted-foreground text-xs">
            Upload max 5 files each up to 5MB
          </p>
        </div>
      </FileUploadDropzone> */}
      <form
        onSubmit={onSubmit}
        className="relative flex w-full flex-col gap-2.5 rounded-md border border-input px-3 py-2 outline-none focus-within:ring-1 focus-within:ring-ring/50"
      >
        <FileUploadList orientation="horizontal" className="p-0">
          {files.map((file, index) => (
            <FileUploadItem key={index} value={file} className="flex-row p-1.5">
              <FileUploadItemPreview className="size-10">
                <FileUploadItemProgress variant="fill" />
              </FileUploadItemPreview>
              <FileUploadItemMetadata />
              <FileUploadItemDelete asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="-top-1 -right-1 absolute size-5 rounded-full"
                  disabled={isUploading}
                >
                  <X className="size-3" />
                </Button>
              </FileUploadItemDelete>
            </FileUploadItem>
          ))}
        </FileUploadList>
        <Textarea
          value={input}
          onChange={onInputChange}
          placeholder="Type your message here..."
          className="w-full resize-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
          disabled={isUploading}
        />
        <div className="absolute right-[8px] bottom-[7px] flex items-center gap-1.5">
          <FileUploadTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="size-7 rounded-sm"
              disabled={isUploading}
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
