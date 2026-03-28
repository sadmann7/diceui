"use client";

import { CheckIcon, ClipboardIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/bases/radix/ui/button";

interface CopyButtonProps extends React.ComponentProps<typeof Button> {
  value: string;
}

export function CopyButton({ value, className, ...props }: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const onCopy = React.useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "size-7 text-muted-foreground hover:text-foreground [&_svg]:size-3.5",
        className,
      )}
      onClick={onCopy}
      {...props}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      <span className="sr-only">Copy</span>
    </Button>
  );
}
