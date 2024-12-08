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
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
CheckboxGroup.displayName = CheckboxGroupPrimitive.Root.displayName;

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
  <CheckboxGroupPrimitive.Item
    ref={ref}
    className={cn("flex w-fit items-center gap-2", className)}
    {...props}
  >
    <CheckboxGroupPrimitive.Indicator className="flex items-center justify-center text-current">
      <Check className="h-4 w-4" />
    </CheckboxGroupPrimitive.Indicator>
    <CheckboxGroupPrimitive.Label className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {children}
    </CheckboxGroupPrimitive.Label>
  </CheckboxGroupPrimitive.Item>
));
CheckboxGroupItem.displayName = CheckboxGroupPrimitive.Item.displayName;

export { CheckboxGroup, CheckboxGroupItem, CheckboxGroupLabel };
