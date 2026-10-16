"use client";

import * as React from "react";

import { DEFAULT_STYLE } from "@/lib/constants";
import { STYLE_NAMES, STYLE_STORAGE_KEY } from "@/lib/style";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/registry/bases/radix/ui/select";
import { STYLES } from "@/registry/styles";

const listeners = new Set<() => void>();

function getStyle() {
  const match = document.body.className.match(/\bstyle-([\w-]+)/);
  return match?.[1] ?? DEFAULT_STYLE;
}

function setStyle(style: string) {
  document.body.classList.remove(...STYLE_NAMES.map((name) => `style-${name}`));
  document.body.classList.add(`style-${style}`);
  try {
    localStorage.setItem(STYLE_STORAGE_KEY, style);
  } catch {}
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function StyleSwitcher({
  className,
  ...props
}: React.ComponentProps<typeof SelectTrigger>) {
  const style = React.useSyncExternalStore(
    subscribe,
    getStyle,
    () => DEFAULT_STYLE,
  );

  return (
    <Select value={style} onValueChange={setStyle}>
      <SelectTrigger
        aria-label="Style"
        size="sm"
        className={cn("h-7 w-28 bg-background text-xs", className)}
        {...props}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {STYLES.map((item) => (
          <SelectItem key={item.name} value={item.name} className="text-xs">
            {item.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
