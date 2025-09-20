import type * as React from "react";
import { cn } from "@/lib/utils";

interface DemoProps extends React.ComponentProps<"div"> {
  first: React.ReactNode;
  second?: React.ReactNode;
  third?: React.ReactNode;
  fourth?: React.ReactNode;
}

export function Demo({
  first,
  second,
  third,
  fourth,
  className,
  ...props
}: DemoProps) {
  return (
    <div
      className={cn(
        "mx-auto flex max-w-3xl flex-col items-center justify-center gap-4",
        className,
      )}
      {...props}
    >
      <DemoCard>{first}</DemoCard>
      {second && <DemoCard>{second}</DemoCard>}
      {third && <DemoCard>{third}</DemoCard>}
      {fourth && <DemoCard>{fourth}</DemoCard>}
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
