"use client";

import * as React from "react";

import { StyleScope } from "@/components/style-scope";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { Skeleton } from "@/styles/radix-nova/ui/skeleton";

const previews = {
  "action-bar": React.lazy(
    () => import("@/components/landing/previews/action-bar"),
  ),
  gauge: React.lazy(() => import("@/components/landing/previews/gauge")),
  "file-upload": React.lazy(
    () => import("@/components/landing/previews/file-upload"),
  ),
  "color-picker": React.lazy(
    () => import("@/components/landing/previews/color-picker"),
  ),
  stepper: React.lazy(() => import("@/components/landing/previews/stepper")),
  "command-stack": React.lazy(
    () => import("@/components/landing/previews/command-stack"),
  ),
  "data-grid": React.lazy(
    () => import("@/components/landing/previews/data-grid"),
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
            <Preview />
          </React.Suspense>
        </StyleScope>
      ) : (
        fallback
      )}
    </div>
  );
}
