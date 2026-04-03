"use client";

import * as React from "react";
import {
  MdxTabs,
  MdxTabsContent,
  MdxTabsList,
  MdxTabsTrigger,
} from "@/components/mdx-tabs";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/registry/bases/radix/ui/skeleton";
import type { RegistryBase } from "@/registry/registry";

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
  fullPreview?: boolean;
}

export function ComponentTabs({
  name,
  base,
  children,
  align = "center",
  preventPreviewFocus,
  scalePreview,
  fullPreview,
  className,
  ...props
}: ComponentTabsProps) {
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
      </div>
      <MdxTabsContent
        value="Preview"
        tabIndex={preventPreviewFocus ? -1 : 0}
        className={cn(
          "not-prose relative",
          preventPreviewFocus &&
            "focus-visible:outline-hidden focus-visible:ring-0",
        )}
      >
        <div
          className={cn(
            "flex h-[420px] w-full justify-center p-10",
            {
              "items-start": align === "start",
              "items-center": align === "center",
              "items-end": align === "end",
              "h-full p-0": fullPreview,
              "sm:p-10": scalePreview,
            },
            className,
          )}
        >
          <React.Suspense fallback={<Skeleton className="size-full" />}>
            <Component />
          </React.Suspense>
        </div>
      </MdxTabsContent>
      <MdxTabsContent
        value="Code"
        className="py-0 **:[figure]:my-0 **:[figure]:rounded-none **:[pre]:h-[424.5px] **:[pre]:px-4"
      >
        {code}
      </MdxTabsContent>
    </MdxTabs>
  );
}
