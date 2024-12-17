"use client";

import * as ComboboxPrimitive from "@diceui/combobox";
import { ChevronDown } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Combobox = ComboboxPrimitive.Root;

const ComboboxAnchor = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Anchor>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Anchor
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent shadow-sm",
      className,
    )}
    {...props}
  />
));
ComboboxAnchor.displayName = ComboboxPrimitive.Anchor.displayName;

const ComboboxInput = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Input>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ComboboxInput.displayName = ComboboxPrimitive.Input.displayName;

const ComboboxTrigger = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-r-md border-input border-l bg-transparent hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children || <ChevronDown className="h-4 w-4" />}
  </ComboboxPrimitive.Trigger>
));
ComboboxTrigger.displayName = ComboboxPrimitive.Trigger.displayName;

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Content
    ref={ref}
    className={cn(
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
      className,
    )}
    {...props}
  >
    <ComboboxPrimitive.Viewport>{children}</ComboboxPrimitive.Viewport>
  </ComboboxPrimitive.Content>
));
ComboboxContent.displayName = ComboboxPrimitive.Content.displayName;

const ComboboxViewport = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Viewport
    ref={ref}
    className={cn("p-1", className)}
    {...props}
  />
));
ComboboxViewport.displayName = ComboboxPrimitive.Viewport.displayName;

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    {children}
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = ComboboxPrimitive.Item.displayName;

export {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxTrigger,
  ComboboxViewport,
};
