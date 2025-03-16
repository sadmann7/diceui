import { cn } from "@/lib/utils";
import {
  Group,
  GroupLabel,
  Item,
  ItemIndicator,
  type ListboxGroupLabelProps,
  type ListboxGroupProps,
  type ListboxItemIndicatorProps,
  type ListboxItemProps,
  type ListboxRootProps,
  Root,
} from "@diceui/listbox";
import { Check } from "lucide-react";
import * as React from "react";

const Listbox = React.forwardRef<
  React.ComponentRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex gap-2 focus-visible:outline-none",
      orientation === "horizontal" && "items-center",
      orientation === "vertical" && "flex-col",
      className,
    )}
    {...props}
  />
));
Listbox.displayName = Root.displayName;

const ListboxGroup = React.forwardRef<
  React.ComponentRef<typeof Group>,
  React.ComponentPropsWithoutRef<typeof Group>
>(({ ...props }, ref) => <Group ref={ref} {...props} />);
ListboxGroup.displayName = Group.displayName;

const ListboxGroupLabel = React.forwardRef<
  React.ElementRef<typeof GroupLabel>,
  React.ComponentPropsWithoutRef<typeof GroupLabel>
>(({ className, ...props }, ref) => (
  <GroupLabel
    ref={ref}
    className={cn(
      "px-2 py-1.5 font-medium text-muted-foreground text-sm",
      className,
    )}
    {...props}
  />
));
ListboxGroupLabel.displayName = GroupLabel.displayName;

const ListboxItem = React.forwardRef<
  React.ComponentRef<typeof Item>,
  React.ComponentPropsWithoutRef<typeof Item>
>(({ className, ...props }, ref) => (
  <Item
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center justify-between gap-2 rounded-md p-4 outline-hidden ring-1 ring-border focus-visible:ring-ring data-disabled:pointer-events-none data-highlighted:bg-accent data-highlighted:text-accent-foreground data-disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
ListboxItem.displayName = Item.displayName;

const ListboxItemIndicator = React.forwardRef<
  React.ComponentRef<typeof ItemIndicator>,
  React.ComponentPropsWithoutRef<typeof ItemIndicator>
>(({ ...props }, ref) => (
  <ItemIndicator ref={ref} {...props}>
    <Check className="size-4" />
  </ItemIndicator>
));
ListboxItemIndicator.displayName = ItemIndicator.displayName;

export {
  Listbox,
  ListboxGroup,
  ListboxGroupLabel,
  ListboxItem,
  ListboxItemIndicator,
};

export type {
  ListboxRootProps,
  ListboxGroupProps,
  ListboxGroupLabelProps,
  ListboxItemProps,
  ListboxItemIndicatorProps,
};
