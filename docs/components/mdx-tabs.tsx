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
      <Tabs className={cn("flex-col", className)} {...props}>
        {children}
      </Tabs>
    </MdxTabsContext>
  );
}

function MdxTabsList({ className, ...props }: ComponentProps<typeof TabsList>) {
  const variant = React.use(MdxTabsContext);
  return (
    <TabsList
      variant={variant}
      className={cn(
        variant === "default" && "h-auto rounded-none bg-transparent p-0",
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
  if (variant === "line") {
    return <TabsTrigger className={cn("px-0", className)} {...props} />;
  }

  return <TabsTrigger className={cn("h-7 text-xs", className)} {...props} />;
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
