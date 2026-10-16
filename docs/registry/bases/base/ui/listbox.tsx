import type * as React from "react";

import * as ListboxPrimitive from "@diceui/listbox";
import { cn } from "cn";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

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
        "cn-listbox",
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
      className={cn("cn-listbox-group", className)}
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
      className={cn("cn-listbox-group-label", className)}
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
      className={cn("cn-listbox-item", className)}
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
      <IconPlaceholder
        lucide="Check"
        tabler="IconCheck"
        hugeicons="Tick02Icon"
        phosphor="CheckIcon"
        remixicon="RiCheckLine"
        className="cn-listbox-item-indicator"
      />
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
