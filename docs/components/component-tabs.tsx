"use client";

import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";
import { Index } from "@/__registry__";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
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

  const Preview = React.useMemo(() => {
    // Use the multi-base index structure: Index[base][style][name]
    const baseIndex = Index[config.base];
    if (!baseIndex) {
      return (
        <p className="text-muted-foreground text-sm">
          Base{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {config.base}
          </code>{" "}
          not found in registry.
        </p>
      );
    }

    const styleIndex = baseIndex[config.style];
    if (!styleIndex) {
      return (
        <p className="text-muted-foreground text-sm">
          Style{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {config.style}
          </code>{" "}
          not found in registry.
        </p>
      );
    }

    const Component = styleIndex[name]?.component;

    if (!Component) {
      return (
        <p className="text-muted-foreground text-sm">
          Component{" "}
          <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
            {name}
          </code>{" "}
          not found in registry.
        </p>
      );
    }

    return <Component />;
  }, [name, config.base, config.style]);

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
            {Preview}
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
