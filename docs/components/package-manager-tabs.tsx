"use client";

import type * as React from "react";
import { MdxTabs, MdxTabsList } from "@/components/mdx-tabs";
import { useConfig } from "@/hooks/use-config";
import { cn } from "@/lib/utils";
import type { Tabs, TabsList } from "@/registry/bases/radix/ui/tabs";

const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn", "bun"] as const;

type PackageManager = (typeof PACKAGE_MANAGERS)[number];

interface PackageManagerTabsProps extends React.ComponentProps<typeof Tabs> {
  groupId?: string;
  persist?: boolean;
}

export function PackageManagerTabs({
  groupId: _groupId,
  persist: _persist,
  children,
  className,
  ...props
}: PackageManagerTabsProps) {
  const [config, setConfig] = useConfig();

  return (
    <MdxTabs
      variant="default"
      value={config.packageManager}
      onValueChange={(value) =>
        setConfig({ ...config, packageManager: value as PackageManager })
      }
      className={cn(
        "not-prose relative mt-4 in-[.fd-steps]:mb-4 w-full gap-0 overflow-hidden rounded-xl border",
        className,
      )}
      {...props}
    >
      {children}
    </MdxTabs>
  );
}

export function PackageManagerTabsList({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsList>) {
  return (
    <div className="flex items-center gap-2 border-b bg-secondary/50 px-3 py-1.5">
      <MdxTabsList className={cn(className)} {...props}>
        {children}
      </MdxTabsList>
    </div>
  );
}
