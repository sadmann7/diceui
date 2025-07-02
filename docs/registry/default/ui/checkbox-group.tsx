import { cn } from "@/lib/utils";
import * as CheckboxGroupPrimitive from "@diceui/checkbox-group";
import { Check } from "lucide-react";
import * as React from "react";

const CheckboxGroup = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Root
    data-slot="checkbox-group"
    ref={ref}
    className={cn("peer flex flex-col gap-3.5", className)}
    {...props}
  />
));
CheckboxGroup.displayName = CheckboxGroupPrimitive.Root.displayName;

const CheckboxGroupLabel = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Label>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Label
    data-slot="checkbox-group-label"
    ref={ref}
    className={cn(
      "text-foreground/70 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
CheckboxGroupLabel.displayName = CheckboxGroupPrimitive.Label.displayName;

const CheckboxGroupList = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.List>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.List
    data-slot="checkbox-group-list"
    ref={ref}
    className={cn(
      "flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
      className,
    )}
    {...props}
  />
));
CheckboxGroupList.displayName = CheckboxGroupPrimitive.List.displayName;

const CheckboxGroupItem = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <label className="flex w-fit select-none items-center gap-2 text-sm leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-destructive has-data-disabled:opacity-50">
    <CheckboxGroupPrimitive.Item
      data-slot="checkbox-group-item"
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring data-invalid:border-destructive [&[data-state=checked]:not([data-invalid])]:bg-primary [&[data-state=checked]:not([data-invalid])]:text-primary-foreground [&[data-state=checked][data-invalid]]:bg-destructive [&[data-state=checked][data-invalid]]:text-primary-foreground [&[data-state=unchecked][data-invalid]]:bg-transparent",
        className,
      )}
      {...props}
    >
      <CheckboxGroupPrimitive.Indicator
        className="flex items-center justify-center text-current"
        asChild
      >
        <Check className="size-3.5" />
      </CheckboxGroupPrimitive.Indicator>
    </CheckboxGroupPrimitive.Item>
    {children}
  </label>
));
CheckboxGroupItem.displayName = CheckboxGroupPrimitive.Item.displayName;

const CheckboxGroupDescription = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Description>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Description
    data-slot="checkbox-group-description"
    ref={ref}
    className={cn(
      "text-[0.8rem] text-muted-foreground leading-none data-invalid:text-destructive",
      className,
    )}
    {...props}
  />
));
CheckboxGroupDescription.displayName =
  CheckboxGroupPrimitive.Description.displayName;

const CheckboxGroupMessage = React.forwardRef<
  React.ComponentRef<typeof CheckboxGroupPrimitive.Message>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Message>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Message
    data-slot="checkbox-group-message"
    ref={ref}
    className={cn(
      "text-[0.8rem] text-muted-foreground leading-none data-invalid:text-destructive",
      className,
    )}
    {...props}
  />
));
CheckboxGroupMessage.displayName = CheckboxGroupPrimitive.Message.displayName;

export {
  CheckboxGroup,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupItem,
  CheckboxGroupDescription,
  CheckboxGroupMessage,
};
