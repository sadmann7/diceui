"use client";

import { cn } from "@/lib/utils";
import * as CheckboxGroupPrimitive from "@diceui/checkbox-group";
import { Check } from "lucide-react";
import * as React from "react";

const CheckboxGroup = React.forwardRef<
  React.ElementRef<typeof CheckboxGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Root
    ref={ref}
    className={cn("flex flex-col gap-2.5", className)}
    {...props}
  />
));
CheckboxGroup.displayName = CheckboxGroupPrimitive.Root.displayName;

const CheckboxGroupItems = React.forwardRef<
  React.ElementRef<typeof CheckboxGroupPrimitive.Items>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Items>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Items
    ref={ref}
    className={cn(
      "flex gap-2 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
      className,
    )}
    {...props}
  />
));
CheckboxGroupItems.displayName = CheckboxGroupPrimitive.Items.displayName;

const CheckboxGroupLabel = React.forwardRef<
  React.ElementRef<typeof CheckboxGroupPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Label>
>(({ className, ...props }, ref) => (
  <CheckboxGroupPrimitive.Label
    ref={ref}
    className={cn(
      "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
CheckboxGroupLabel.displayName = CheckboxGroupPrimitive.Label.displayName;

const CheckboxGroupItem = React.forwardRef<
  React.ElementRef<typeof CheckboxGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CheckboxGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <label
    className={cn(
      "flex select-none items-center gap-2 text-sm leading-none",
      "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
    )}
  >
    <CheckboxGroupPrimitive.Item
      ref={ref}
      className={cn(
        "h-4 w-4 shrink-0 rounded-sm border border-primary shadow",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxGroupPrimitive.Indicator
        className="flex items-center justify-center text-current"
        asChild
      >
        <Check className="h-4 w-4" />
      </CheckboxGroupPrimitive.Indicator>
    </CheckboxGroupPrimitive.Item>
    {children}
  </label>
));
CheckboxGroupItem.displayName = CheckboxGroupPrimitive.Item.displayName;

export {
  CheckboxGroup,
  CheckboxGroupItem,
  CheckboxGroupItems,
  CheckboxGroupLabel,
};
