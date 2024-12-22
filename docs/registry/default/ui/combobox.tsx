"use client";

import * as ComboboxPrimitive from "@diceui/combobox";
import { Check, ChevronDown } from "lucide-react";
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
      "flex h-9 w-9 items-center justify-center rounded-r-md border-input bg-transparent text-muted-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
  <ComboboxPrimitive.Positioner className={cn("relative z-50", className)}>
    <ComboboxPrimitive.Content
      ref={ref}
      className="data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 w-full min-w-[var(--dice-anchor-width)] origin-[var(--dice-transform-origin)] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in"
      {...props}
    >
      {children}
    </ComboboxPrimitive.Content>
  </ComboboxPrimitive.Positioner>
));
ComboboxContent.displayName = ComboboxPrimitive.Content.displayName;

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pr-2 pl-8 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <ComboboxPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </ComboboxPrimitive.ItemIndicator>
    </span>
    <ComboboxPrimitive.ItemText>{children}</ComboboxPrimitive.ItemText>
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = ComboboxPrimitive.Item.displayName;

const ComboboxEmpty = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Empty
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  />
));
ComboboxEmpty.displayName = ComboboxPrimitive.Empty.displayName;

export {
  Combobox,
  ComboboxAnchor,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxTrigger,
};
