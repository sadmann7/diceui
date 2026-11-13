"use client";

import * as React from "react";

import { StyleScope } from "@/components/style-scope";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { Skeleton } from "@/styles/radix-nova/ui/skeleton";

const previews = {
  "action-bar": React.lazy(
    () => import("@/components/lobby/previews/action-bar"),
  ),
  gauge: React.lazy(() => import("@/components/lobby/previews/gauge")),
  "file-upload": React.lazy(
    () => import("@/components/lobby/previews/file-upload"),
  ),
  "color-picker": React.lazy(
    () => import("@/components/lobby/previews/color-picker"),
  ),
  stepper: React.lazy(() => import("@/components/lobby/previews/stepper")),
  "command-stack": React.lazy(
    () => import("@/components/lobby/previews/command-stack"),
  ),
  "data-grid": React.lazy(
    () => import("@/components/lobby/previews/data-grid"),
  ),
};

export type PreviewName = keyof typeof previews;

export function LivePreview({ name }: { name: PreviewName }) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isNearViewport = useNearViewport(ref);
  const Preview = previews[name];
  const fallback = <Skeleton className="size-full rounded-none" />;

  return (
    <div ref={ref} className="relative flex min-h-0 flex-1 flex-col">
      {isNearViewport ? (
        <StyleScope>
          <React.Suspense fallback={fallback}>
            <div className="flex min-h-0 flex-1 animate-in flex-col duration-200 fade-in-0 motion-reduce:animate-none">
              <Preview />
            </div>
          </React.Suspense>
        </StyleScope>
      ) : (
        fallback
      )}
    </div>
  );
}
