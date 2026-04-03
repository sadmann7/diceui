"use client";

import type * as React from "react";
import { MdxTabs } from "@/components/mdx-tabs";
import { type Config, useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import type { Tabs } from "@/registry/bases/radix/ui/tabs";

export function CodeTabs({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  const [config, setConfig] = useConfig();

  return (
    <MdxTabs
      variant="line"
      value={config.installationType ?? "cli"}
      onValueChange={(value) =>
        setConfig({
          ...config,
          installationType: value as Config["installationType"],
        })
      }
      className={cn(
        "not-prose relative mt-6 w-full *:data-[slot=tabs-list]:gap-6",
        className,
      )}
      {...props}
    >
      {children}
    </MdxTabs>
  );
}
