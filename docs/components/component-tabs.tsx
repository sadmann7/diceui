"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/registry/bases/radix/ui/skeleton";

interface ComponentTabsProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  preventPreviewFocus?: boolean;
  scalePreview?: boolean;
  fullPreview?: boolean;
}

// Load a registry example lazily. Conditional branches (one per base) create
// bounded context modules so Turbopack compiles each base's examples as a
// separate chunk rather than one monolithic catch-all bundle.
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

export function ComponentTabs({
  name,
  children,
  align = "center",
  preventPreviewFocus,
  scalePreview,
  fullPreview,
  className,
}: ComponentTabsProps) {
  const [config] = useConfig();

  // rehypeComponent injects a single <pre> block as the first child.
  const code = React.Children.toArray(children)[0] as React.ReactElement;

  const Component = React.useMemo(
    () => getExampleComponent(config.base, name),
    [config.base, name],
  );

  return (
    <Tabs items={["Preview", "Code"]} className="rounded-md">
      <Tab
        value="Preview"
        tabIndex={preventPreviewFocus ? -1 : 0}
        className={cn(
          "not-prose relative rounded-none",
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
      </Tab>
      <Tab
        value="Code"
        className="rounded-none py-0 **:[figure]:rounded-none **:[pre]:h-[424.5px] **:[pre]:px-4"
      >
        {code}
      </Tab>
    </Tabs>
  );
}
