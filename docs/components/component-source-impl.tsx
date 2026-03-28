"use client";

import { ChevronDownIcon, FileIcon } from "lucide-react";
import * as React from "react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";
import { Button } from "@/registry/bases/radix/ui/button";
import { Icons } from "./icons";

function getLanguageIcon(language: string) {
  switch (language) {
    case "json":
      return <Icons.json className="size-3.5" />;
    case "css":
      return <Icons.css className="size-3.5 fill-foreground" />;
    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "typescript":
      return <Icons.ts className="size-3.5 fill-foreground" />;
    default:
      return <FileIcon className="size-3.5" />;
  }
}

interface ComponentSourceImplProps extends React.ComponentProps<"figure"> {
  code: string;
  highlightedCode: string;
  language: string;
  title?: string;
  collapsible?: boolean;
}

export function ComponentSourceImpl({
  code,
  highlightedCode,
  language,
  title,
  collapsible,
  className,
  ...props
}: ComponentSourceImplProps) {
  const [open, setOpen] = React.useState(!collapsible);

  return (
    <figure
      data-rehype-pretty-code-figure=""
      className={cn("my-4 overflow-hidden rounded-xl border", className)}
      {...props}
    >
      <figcaption
        data-rehype-pretty-code-title=""
        data-language={language}
        className="flex items-center gap-1.5 border-b bg-secondary/50 px-4 py-2 text-muted-foreground text-sm [&_svg]:opacity-70"
      >
        {getLanguageIcon(language)}
        <span className="flex-1 truncate">{title}</span>
        {collapsible && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-2 text-muted-foreground text-xs hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "Collapse" : "Expand"}
            <ChevronDownIcon
              className={cn(
                "size-3.5 transition-transform",
                open && "rotate-180",
              )}
            />
          </Button>
        )}
        <CopyButton value={code} />
      </figcaption>
      <div
        className={cn(
          "relative overflow-hidden transition-all duration-200",
          !open && "max-h-64",
        )}
      >
        <div
          className="[&>pre]:max-h-none [&>pre]:overflow-visible [&>pre]:bg-secondary/50 [&>pre]:px-4 [&>pre]:py-4 [&>pre]:text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
        {!open && (
          <div className="absolute inset-x-0 bottom-0 flex h-16 items-center justify-center bg-linear-to-b from-transparent to-background">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-3 text-xs"
              onClick={() => setOpen(true)}
            >
              Expand
            </Button>
          </div>
        )}
      </div>
    </figure>
  );
}
