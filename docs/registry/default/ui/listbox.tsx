import { cn } from "@/lib/utils";
import * as ListboxPrimitive from "@diceui/listbox";
import { Check } from "lucide-react";
import * as React from "react";

const Listbox = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Root>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ListboxPrimitive.Root
    data-slot="listbox"
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex gap-2 focus-visible:outline-none",
      orientation === "vertical" &&
        "flex-col *:data-[slot=listbox-group]:flex-col",
      className,
    )}
    {...props}
  />
)) as ListboxPrimitive.ListboxRootComponentProps;
Listbox.displayName = ListboxPrimitive.Root.displayName;

const ListboxGroup = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Group>
>(({ className, ...props }, ref) => (
  <ListboxPrimitive.Group
    data-slot="listbox-group"
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
ListboxGroup.displayName = ListboxPrimitive.Group.displayName;

const ListboxGroupLabel = React.forwardRef<
  React.ElementRef<typeof ListboxPrimitive.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <ListboxPrimitive.GroupLabel
    data-slot="listbox-group-label"
    ref={ref}
    className={cn(
      "px-2 pt-1 font-medium text-muted-foreground text-sm",
      className,
    )}
    {...props}
  />
));
ListboxGroupLabel.displayName = ListboxPrimitive.GroupLabel.displayName;

const ListboxItem = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ListboxPrimitive.Item
    data-slot="listbox-item"
    ref={ref}
    className={cn(
      "flex w-full cursor-default select-none items-center justify-between gap-2 rounded-md p-4 outline-hidden ring-1 ring-border focus-visible:ring-ring data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ListboxItem.displayName = ListboxPrimitive.Item.displayName;

const ListboxItemIndicator = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.ItemIndicator>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.ItemIndicator>
>(({ ...props }, ref) => (
  <ListboxPrimitive.ItemIndicator
    data-slot="listbox-item-indicator"
    ref={ref}
    {...props}
  >
    <Check className="size-4" />
  </ListboxPrimitive.ItemIndicator>
));
ListboxItemIndicator.displayName = ListboxPrimitive.ItemIndicator.displayName;

export {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
};
