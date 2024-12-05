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
  console.log({ src: props.src });

  return (
    <CodeBlockWrapper
      expandButtonTitle="Expand"
      className={cn("my-6 overflow-hidden rounded-md", className)}
      {...props}
    >
      {children}
    </CodeBlockWrapper>
  );
}
