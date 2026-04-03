import type * as React from "react";
import { cn } from "@/lib/utils";

function Demo({ children, className, ...props }: React.ComponentProps<"div">) {
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

function DemoItem({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="demo-item"
      className={cn(
        "grid min-h-[calc(100svh-10rem)] w-full grid-cols-1 place-items-center",
        className,
      )}
      {...props}
    />
  );
}

function DemoItemGroup({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="demo-item-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Demo, DemoItemGroup };
