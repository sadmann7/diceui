import Link from "next/link";
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
      className={cn(
        "inline-flex h-9 items-center gap-6 border-border border-b",
        className,
      )}
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
              "relative inline-flex items-center justify-center whitespace-nowrap pb-2 font-medium text-sm transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "text-foreground after:absolute after:right-0 after:bottom-0 after:left-0 after:h-0.5 after:bg-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {baseItem.label}
          </Link>
        );
      })}
    </div>
  );
}
