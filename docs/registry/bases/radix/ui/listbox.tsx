import type * as React from "react";

import * as ListboxPrimitive from "@diceui/listbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Listbox = (({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ListboxPrimitive.Root>) => {
  return (
    <ListboxPrimitive.Root
      data-slot="listbox"
      orientation={orientation}
      className={cn(
        "flex gap-2 focus-visible:outline-none",
        orientation === "vertical" &&
          "flex-col *:data-[slot=listbox-group]:flex-col",
        className,
      )}
      {...props}
    />
  );
}) as ListboxPrimitive.ListboxRootComponentProps;

function ListboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof ListboxPrimitive.Group>) {
  return (
    <ListboxPrimitive.Group
      data-slot="listbox-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function ListboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof ListboxPrimitive.GroupLabel>) {
  return (
    <ListboxPrimitive.GroupLabel
      data-slot="listbox-group-label"
      className={cn(
        "px-2 pt-1 text-sm font-medium text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ListboxItem({
  className,
  ...props
}: React.ComponentProps<typeof ListboxPrimitive.Item>) {
  return (
    <ListboxPrimitive.Item
      data-slot="listbox-item"
      className={cn(
        "flex w-full cursor-default items-center justify-between gap-2 rounded-md p-4 ring-1 ring-border outline-hidden select-none focus-visible:ring-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className,
      )}
      {...props}
    />
  );
}

function ListboxItemIndicator({
  ...props
}: React.ComponentProps<typeof ListboxPrimitive.ItemIndicator>) {
  return (
    <ListboxPrimitive.ItemIndicator
      data-slot="listbox-item-indicator"
      {...props}
    >
      <Check className="size-4" />
    </ListboxPrimitive.ItemIndicator>
  );
}

export {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
};
