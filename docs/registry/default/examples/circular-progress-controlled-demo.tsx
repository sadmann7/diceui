"use client";

import * as React from "react";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressRange,
  CircularProgressTrack,
  CircularProgressValueText,
} from "@/registry/default/ui/circular-progress";

export default function CircularProgressControlledDemo() {
  const [uploadProgress, setUploadProgress] = React.useState<number | null>(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const simulateUpload = React.useCallback(() => {
    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return Math.min(100, prev + Math.random() * 15);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const resetUpload = React.useCallback(() => {
    setUploadProgress(0);
    setIsUploading(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <CircularProgress
          value={uploadProgress}
          min={0}
          max={100}
          size={80}
          trackWidth={6}
        >
          <CircularProgressIndicator>
            <CircularProgressTrack />
            <CircularProgressRange />
          </CircularProgressIndicator>
          <CircularProgressValueText className="font-semibold text-base" />
        </CircularProgress>

        <div className="flex flex-col gap-2">
          <div className="font-medium text-sm">Upload Progress</div>
          <div className="text-muted-foreground text-xs">
            Status:{" "}
            {isUploading
              ? "Uploading..."
              : uploadProgress === 100
                ? "Complete"
                : "Ready"}
          </div>
          <div className="text-muted-foreground text-xs">
            Progress:{" "}
            {uploadProgress === null
              ? "Indeterminate"
              : `${Math.round(uploadProgress)}%`}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={simulateUpload}
          disabled={isUploading}
          className="rounded bg-primary px-4 py-2 text-primary-foreground text-sm disabled:opacity-50"
        >
          {isUploading ? "Uploading..." : "Start Upload"}
        </button>
        <button
          onClick={resetUpload}
          disabled={isUploading}
          className="rounded bg-secondary px-4 py-2 text-secondary-foreground text-sm disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={() => setUploadProgress(null)}
          disabled={isUploading}
          className="rounded bg-muted px-4 py-2 text-muted-foreground text-sm disabled:opacity-50"
        >
          Set Indeterminate
        </button>
      </div>
    </div>
  );
}
