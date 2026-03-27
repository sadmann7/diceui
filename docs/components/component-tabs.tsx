"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/registry/bases/radix/ui/skeleton";
import { STYLES } from "@/registry/styles";

// Map styles for compatibility
const styles = STYLES.map((s) => ({ name: s.name, label: s.title }));

interface ComponentTabsProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  preventPreviewFocus?: boolean;
  scalePreview?: boolean;
  fullPreview?: boolean;
}

// Load a registry example lazily. Uses conditional branches (not a single
// template literal) so Turbopack creates one bounded context chunk per base
// rather than a single catch-all chunk across the entire registry tree.
function getExampleComponent(base: string, name: string) {
  if (base === "base") {
    return React.lazy(() =>
      import(`@/registry/bases/base/examples/${name}`).then((mod) => ({
        default: mod.default,
      })),
    );
  }
  // Default to radix
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
  const index = styles.findIndex((style) => style.name === config.style);

  const Codes = React.Children.toArray(children) as React.ReactElement[];
  const Code = Codes[index];

  // Stable lazy component — only recreated when base or name changes.
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
        {Code}
      </Tab>
    </Tabs>
  );
}
