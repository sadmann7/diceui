"use client";

import * as React from "react";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import { Tabs } from "@/registry/bases/radix/ui/tabs";

export function CodeTabs({
  children,
  className,
  ...props
}: React.ComponentProps<typeof Tabs>) {
  const [config, setConfig] = useConfig();

  const installationType = React.useMemo(
    () => config.installationType ?? "cli",
    [config.installationType],
  );

  const onValueChange = React.useCallback(
    (value: string) => {
      setConfig({ ...config, installationType: value as "cli" | "manual" });
    },
    [config, setConfig],
  );

  return (
    <Tabs
      value={installationType}
      onValueChange={onValueChange}
      className={cn(
        "not-prose relative mt-6 w-full *:data-[slot=tabs-list]:gap-6",
        className,
      )}
      {...props}
    >
      {children}
    </Tabs>
  );
}
