import { cn } from "@/lib/utils";
import * as ListboxPrimitive from "@diceui/listbox";
import { Check } from "lucide-react";
import * as React from "react";

const Listbox = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Root>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ListboxPrimitive.Root
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex gap-2 focus-visible:outline-none",
      orientation === "vertical" && "flex-col",
      className,
    )}
    {...props}
  />
)) as ListboxPrimitive.ListboxRootComponentProps;
Listbox.displayName = ListboxPrimitive.Root.displayName;

const ListboxGroup = React.forwardRef<
  React.ComponentRef<typeof ListboxPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.Group>
>(({ ...props }, ref) => <ListboxPrimitive.Group ref={ref} {...props} />);
ListboxGroup.displayName = ListboxPrimitive.Group.displayName;

const ListboxGroupLabel = React.forwardRef<
  React.ElementRef<typeof ListboxPrimitive.GroupLabel>,
  React.ComponentPropsWithoutRef<typeof ListboxPrimitive.GroupLabel>
>(({ className, ...props }, ref) => (
  <ListboxPrimitive.GroupLabel
    ref={ref}
    className={cn(
      "px-2 py-1.5 font-medium text-muted-foreground text-sm",
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
  <ListboxPrimitive.ItemIndicator ref={ref} {...props}>
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
