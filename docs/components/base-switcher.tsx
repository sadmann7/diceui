import Link from "next/link";
import type * as React from "react";
import { cn } from "@/lib/utils";
import type { RegistryBase } from "@/registry";

const bases: { label: string; value: RegistryBase }[] = [
  { label: "Radix UI", value: "radix" },
  { label: "Base UI", value: "base" },
];

interface BaseSwitcherProps extends React.ComponentProps<"div"> {
  base: RegistryBase;
  pathname: string;
}

export function BaseSwitcher({
  base,
  pathname,
  className,
  ...props
}: BaseSwitcherProps) {
  return (
    <div
      role="tablist"
      className={cn("inline-flex h-9 items-center gap-6", className)}
      {...props}
    >
      {bases.map((baseItem) => {
        const href = pathname.replace(
          `/components/${base}/`,
          `/components/${baseItem.value}/`,
        );
        const isActive = base === baseItem.value;

        return (
          <Link
            key={baseItem.value}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap border-b-2 pb-1.5 font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50",
              "not-aria-selected:border-transparent not-aria-selected:text-muted-foreground not-aria-selected:hover:text-foreground aria-selected:border-foreground aria-selected:text-foreground",
            )}
          >
            {baseItem.label}
          </Link>
        );
      })}
    </div>
  );
}
