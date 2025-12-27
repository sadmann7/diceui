"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { usePending } from "@/registry/default/components/pending";

export default function UsePendingCustomDemo() {
  const [isDownloading, setIsDownloading] = useState(false);
  const { pendingProps, isPending } = usePending({
    isPending: isDownloading,
  });

  const onDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => {
      setIsDownloading(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        {...pendingProps}
        onClick={onDownload}
        className="inline-flex items-center gap-2 rounded-lg border bg-background px-4 py-2 font-medium text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-pending:cursor-wait data-pending:opacity-70"
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Download className="size-4" />
        )}
        {isPending ? "Downloading..." : "Download Report"}
      </button>

      <p className="text-center text-muted-foreground text-sm">
        Custom button with <code className="text-xs">data-[pending]</code>{" "}
        styling
      </p>
    </div>
  );
}
