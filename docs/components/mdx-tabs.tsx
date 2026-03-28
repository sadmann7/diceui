"use client";

import type { ComponentProps } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/registry/bases/radix/ui/tabs";

type MdxTabsVariant = "line" | "default";

const MdxTabsContext = React.createContext<MdxTabsVariant>("default");

interface MdxTabsProps extends ComponentProps<typeof Tabs> {
  variant?: MdxTabsVariant;
}

function MdxTabs({
  variant = "default",
  className,
  children,
  ...props
}: MdxTabsProps) {
  return (
    <MdxTabsContext value={variant}>
      <Tabs className={cn(className)} {...props}>
        {children}
      </Tabs>
    </MdxTabsContext>
  );
}

function MdxTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  const variant = React.use(MdxTabsContext);
  return (
    <TabsList
      className={cn(
        variant === "line"
          ? "justify-start gap-4 rounded-none bg-transparent px-0"
          : "h-auto rounded-none bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}

function MdxTabsTrigger({
  className,
  ...props
}: ComponentProps<typeof TabsTrigger>) {
  const variant = React.use(MdxTabsContext);
  return (
    <TabsTrigger
      className={cn(
        variant === "line"
          ? "rounded-none border-0 border-transparent border-b-2 bg-transparent px-0 pb-3 text-base text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none! dark:data-[state=active]:border-primary dark:data-[state=active]:bg-transparent"
          : "h-7 rounded-md border border-transparent px-2 py-0.5 text-muted-foreground text-xs shadow-none! data-[state=active]:border-input data-[state=active]:bg-background data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function MdxTabsContent({
  className,
  ...props
}: ComponentProps<typeof TabsContent>) {
  const variant = React.use(MdxTabsContext);
  return (
    <TabsContent
      className={cn(
        variant === "line"
          ? "relative [&>.steps]:mt-6 [&_h3.font-heading]:font-medium [&_h3.font-heading]:text-base"
          : "[&_figure]:my-0 [&_figure]:rounded-none [&_figure]:border-0 [&_figure]:shadow-none",
        className,
      )}
      {...props}
    />
  );
}

export { MdxTabs, MdxTabsList, MdxTabsTrigger, MdxTabsContent };
