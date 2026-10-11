import type * as React from "react";

import { cn } from "@/lib/utils";

export function NewBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <>
      <span
        aria-hidden="true"
        title="New"
        className={cn("size-2 shrink-0 rounded-full bg-blue-500", className)}
        {...props}
      />
      <span className="sr-only">New</span>
    </>
  );
}
