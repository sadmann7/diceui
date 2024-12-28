"use client";

import * as ComboboxPrimitive from "@diceui/combobox";
import { Check, ChevronDown, X } from "lucide-react";
import * as React from "react";

import { cn } from "@/lib/utils";

const Combobox = ComboboxPrimitive.Root;

const ComboboxLabel = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Label>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Label
    ref={ref}
    className={cn("px-0.5 py-1.5 font-semibold text-sm", className)}
    {...props}
  />
));
ComboboxLabel.displayName = ComboboxPrimitive.Label.displayName;

const ComboboxAnchor = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Anchor>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Anchor>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Anchor
    ref={ref}
    className={cn(
      "relative flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-transparent px-3 py-2 shadow-sm data-[focused]:ring-1 data-[focused]:ring-ring",
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
      "flex h-9 w-full rounded-md bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
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
      "flex shrink-0 items-center justify-center rounded-r-md border-input bg-transparent text-muted-foreground transition-colors hover:text-foreground/80 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    {children || <ChevronDown className="h-4 w-4" />}
  </ComboboxPrimitive.Trigger>
));
ComboboxTrigger.displayName = ComboboxPrimitive.Trigger.displayName;

const ComboboxCancel = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Cancel
    ref={ref}
    className={cn(
      "-translate-y-1/2 absolute top-1/2 right-1 flex h-6 w-6 items-center justify-center rounded-sm bg-background opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className,
    )}
    {...props}
  />
));
ComboboxCancel.displayName = ComboboxPrimitive.Cancel.displayName;

const ComboboxBadgeList = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.BadgeList>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.BadgeList>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.BadgeList
    ref={ref}
    className={cn("flex flex-wrap items-center gap-1.5", className)}
    {...props}
  />
));
ComboboxBadgeList.displayName = ComboboxPrimitive.BadgeList.displayName;

const ComboboxBadgeItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.BadgeItem>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.BadgeItem>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.BadgeItem
    ref={ref}
    className={cn(
      "inline-flex items-center justify-between gap-1 rounded-sm bg-secondary px-2 py-0.5",
      className,
    )}
    {...props}
  >
    <span className="truncate text-[13px] text-secondary-foreground">
      {children}
    </span>
    <ComboboxPrimitive.BadgeItemDelete className="shrink-0 rounded p-0.5 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[highlighted]:bg-destructive">
      <X className="h-3 w-3" />
    </ComboboxPrimitive.BadgeItemDelete>
  </ComboboxPrimitive.BadgeItem>
));
ComboboxBadgeItem.displayName = ComboboxPrimitive.BadgeItem.displayName;

const ComboboxContent = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <ComboboxPrimitive.Portal>
    <ComboboxPrimitive.Content
      ref={ref}
      sideOffset={6}
      className={cn(
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-fit min-w-[var(--dice-anchor-width)] origin-[var(--dice-transform-origin)] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=open]:animate-in",
        className,
      )}
      {...props}
    >
      {children}
    </ComboboxPrimitive.Content>
  </ComboboxPrimitive.Portal>
));
ComboboxContent.displayName = ComboboxPrimitive.Content.displayName;

const ComboboxProgress = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Progress>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Progress>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Progress
    ref={ref}
    className={cn("py-6 text-center text-sm", className)}
    {...props}
  >
    Loading...
  </ComboboxPrimitive.Progress>
));

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

const ComboboxGroup = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Group>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Group
    ref={ref}
    className={cn("overflow-hidden", className)}
    {...props}
  />
));
ComboboxGroup.displayName = ComboboxPrimitive.Group.displayName;

const ComboboxGroupLabel = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.GroupLabel
    ref={ref}
    className={cn(
      "px-2 py-1.5 font-semibold text-muted-foreground text-xs",
      className,
    )}
    {...props}
  />
));
ComboboxGroupLabel.displayName = ComboboxPrimitive.GroupLabel.displayName;

const ComboboxItem = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Item> & {
    /**
     * The side of the item indicator relative to the item text.
     * @default "left"
     */
    indicatorSide?: "left" | "right";
  }
>(({ className, children, indicatorSide = "left", ...props }, ref) => (
  <ComboboxPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 text-sm outline-none data-[disabled]:pointer-events-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:opacity-50",
      indicatorSide === "left" ? "pr-2 pl-8" : "pr-8 pl-2",
      className,
    )}
    {...props}
  >
    <ComboboxPrimitive.ItemIndicator
      className={cn(
        "absolute flex h-3.5 w-3.5 items-center justify-center",
        indicatorSide === "left" ? "left-2" : "right-2",
      )}
    >
      <Check className="h-4 w-4" />
    </ComboboxPrimitive.ItemIndicator>
    <ComboboxPrimitive.ItemText>{children}</ComboboxPrimitive.ItemText>
  </ComboboxPrimitive.Item>
));
ComboboxItem.displayName = ComboboxPrimitive.Item.displayName;

const ComboboxSeparator = React.forwardRef<
  React.ElementRef<typeof ComboboxPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof ComboboxPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <ComboboxPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
));
ComboboxSeparator.displayName = ComboboxPrimitive.Separator.displayName;

export {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxTrigger,
  ComboboxCancel,
  ComboboxBadgeList,
  ComboboxBadgeItem,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxGroupLabel,
  ComboboxItem,
  ComboboxLabel,
  ComboboxProgress,
  ComboboxSeparator,
};
