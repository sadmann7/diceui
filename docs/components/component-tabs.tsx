"use client";

import { Index } from "@/__registry__";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { styles } from "@/registry/registry-styles";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";

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
    const Component = Index[config.style][name]?.component;

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
  }, [name, config.style]);

  return (
    <Tabs items={["Preview", "Code"]} className="rounded-md">
      <Tab
        value="Preview"
        className={cn(
          "not-prose relative rounded-none",
          preventPreviewFocus &&
            "focus-visible:outline-hidden focus-visible:ring-0",
        )}
        tabIndex={preventPreviewFocus ? -1 : 0}
      >
        <div
          className={cn(
            "flex h-[400px] w-full justify-center p-10",
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
      <Tab value="Code" className="component-block rounded-none py-0">
        {Code}
      </Tab>
    </Tabs>
  );
}
