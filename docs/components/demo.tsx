import type * as React from "react";
import { cn } from "@/lib/utils";

interface DemoProps extends React.ComponentProps<"div"> {}

export function Demo({ children, className, ...props }: DemoProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col items-center justify-center gap-4",
        className,
      )}
      {...props}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => <DemoCard key={index}>{child}</DemoCard>)
      ) : (
        <DemoCard>{children}</DemoCard>
      )}
    </div>
  );
}

function DemoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100svh-10rem)] w-full items-center justify-center">
      {children}
    </div>
  );
}
