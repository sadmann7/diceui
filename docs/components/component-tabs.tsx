"use client";

import * as React from "react";

import type { RegistryBase } from "@/registry/registry";

import {
  MdxTabs,
  MdxTabsContent,
  MdxTabsList,
  MdxTabsTrigger,
} from "@/components/mdx-tabs";
import { StyleScope } from "@/components/style-scope";
import { StyleSwitcher } from "@/components/style-switcher";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/styles/radix-nova/ui/skeleton";

function getExampleComponent(base: string, name: string) {
  if (base === "base") {
    return React.lazy(() =>
      import(`@/registry/bases/base/examples/${name}`).then((mod) => ({
        default: mod.default,
      })),
    );
  }

  return React.lazy(() =>
    import(`@/registry/bases/radix/examples/${name}`).then((mod) => ({
      default: mod.default,
    })),
  );
}

interface ComponentTabsProps extends React.ComponentProps<typeof MdxTabs> {
  name: string;
  base: RegistryBase;
  align?: "start" | "center" | "end";
  preventPreviewFocus?: boolean;
  scalePreview?: boolean;
  lazy?: boolean;
}

export function ComponentTabs({
  name,
  base,
  children,
  align = "center",
  preventPreviewFocus,
  scalePreview,
  lazy = false,
  className,
  ...props
}: ComponentTabsProps) {
  const previewRef = React.useRef<HTMLDivElement>(null);
  const isNearViewport = useNearViewport(previewRef, { enabled: lazy });
  const code = React.Children.toArray(children)[0] as React.ReactElement;

  const Component = React.useMemo(
    () => getExampleComponent(base, name),
    [base, name],
  );

  return (
    <MdxTabs
      variant="default"
      defaultValue="Preview"
      className="not-prose gap-0 overflow-hidden rounded-xl border"
      {...props}
    >
      <div className="flex items-center border-b bg-secondary/50 px-3 py-1.5">
        <MdxTabsList>
          <MdxTabsTrigger value="Preview">Preview</MdxTabsTrigger>
          <MdxTabsTrigger value="Code">Code</MdxTabsTrigger>
        </MdxTabsList>
        <StyleSwitcher className="ml-auto" />
      </div>
      <MdxTabsContent
        value="Preview"
        tabIndex={preventPreviewFocus ? -1 : 0}
        className={cn(
          "not-prose relative",
          preventPreviewFocus &&
            "focus-visible:ring-0 focus-visible:outline-hidden",
        )}
      >
        <div
          ref={previewRef}
          className={cn(
            "flex h-115 w-full justify-center p-10",
            {
              "items-start": align === "start",
              "items-center": align === "center",
              "items-end": align === "end",
              "sm:p-10": scalePreview,
            },
            className,
          )}
        >
          {isNearViewport ? (
            <StyleScope>
              <React.Suspense fallback={<Skeleton className="size-full" />}>
                <Component />
              </React.Suspense>
            </StyleScope>
          ) : (
            <Skeleton className="size-full" />
          )}
        </div>
      </MdxTabsContent>
      <MdxTabsContent
        value="Code"
        className="py-0 **:[figure]:my-0 **:[figure]:rounded-none **:[pre]:h-105.5 **:[pre]:px-4"
      >
        {code}
      </MdxTabsContent>
    </MdxTabs>
  );
}
