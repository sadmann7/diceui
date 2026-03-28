"use client";

import { useCopyButton } from "fumadocs-ui/utils/use-copy-button";
import { CheckIcon, ClipboardIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/bases/radix/ui/button";

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [copied, onClick] = useCopyButton(() => {
    return navigator.clipboard.writeText(value);
  });

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "size-7 text-muted-foreground hover:text-foreground [&_svg]:size-3.5",
        className,
      )}
      onClick={onClick}
      {...props}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
