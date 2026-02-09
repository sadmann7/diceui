"use client";

/**
 * @see https://github.com/shadcn-ui/ui/blob/main/apps/www/components/component-source.tsx
 */

import type * as React from "react";

import { CodeBlockWrapper } from "@/components/code-block-wrapper";
import { cn } from "@/lib/utils";

interface ComponentSourceProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
}

export function ComponentSource({
  children,
  className,
  ...props
}: ComponentSourceProps) {
  return (
    <CodeBlockWrapper
      expandButtonTitle="Expand"
      className={cn("overflow-hidden rounded-md [&_pre]:px-4", className)}
      {...props}
    >
      {children}
    </CodeBlockWrapper>
  );
}
