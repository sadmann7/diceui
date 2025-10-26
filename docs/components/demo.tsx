import type * as React from "react";
import { cn } from "@/lib/utils";

interface DemoProps extends React.ComponentProps<"div"> {}

export function Demo({ children, className, ...props }: DemoProps) {
  return (
    <div
      data-slot="demo"
      className={cn(
        "mx-auto grid w-full max-w-3xl grid-cols-1 place-items-center gap-4",
        className,
      )}
      {...props}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <DemoItem key={child.key ?? index}>{child}</DemoItem>
        ))
      ) : (
        <DemoItem>{children}</DemoItem>
      )}
    </div>
  );
}

interface DemoItemProps extends React.ComponentProps<"div"> {}

function DemoItem({ className, ...props }: DemoItemProps) {
  return (
    <div
      data-slot="demo-item"
      className={cn(
        "grid min-h-[calc(100svh-10rem)] w-full place-items-center",
        className,
      )}
      {...props}
    />
  );
}
