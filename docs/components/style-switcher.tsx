"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import {
  getServerStyle,
  getStyle,
  setStyle,
  subscribeStyle,
} from "@/lib/style";
import { cn } from "@/lib/utils";
import { STYLES } from "@/registry/styles";
import { Button } from "@/styles/radix-nova/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/styles/radix-nova/ui/dropdown-menu";

export function StyleSwitcher({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  const style = React.useSyncExternalStore(
    subscribeStyle,
    getStyle,
    getServerStyle,
  );
  const title = STYLES.find((item) => item.name === style)?.title ?? style;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={`Style: ${title}`}
          variant="outline"
          size="sm"
          className={cn("h-7 gap-1 bg-background px-2 text-xs", className)}
          {...props}
        >
          {title}
          <ChevronDownIcon className="size-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-32">
        <DropdownMenuRadioGroup value={style} onValueChange={setStyle}>
          {STYLES.map((item) => (
            <DropdownMenuRadioItem
              key={item.name}
              value={item.name}
              className="text-xs"
            >
              {item.title}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
