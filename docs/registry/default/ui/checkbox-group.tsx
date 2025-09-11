import * as CheckboxGroupPrimitive from "@diceui/checkbox-group";
import { Check } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function CheckboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Root>) {
  return (
    <CheckboxGroupPrimitive.Root
      data-slot="checkbox-group"
      className={cn("peer flex flex-col gap-3.5", className)}
      {...props}
    />
  );
}

function CheckboxGroupLabel({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Label>) {
  return (
    <CheckboxGroupPrimitive.Label
      data-slot="checkbox-group-label"
      className={cn(
        "text-foreground/70 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

function CheckboxGroupList({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.List>) {
  return (
    <CheckboxGroupPrimitive.List
      data-slot="checkbox-group-list"
      className={cn(
        "flex gap-3 data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

function CheckboxGroupItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Item>) {
  return (
    <label className="flex w-fit select-none items-center gap-2 text-sm leading-none has-data-disabled:cursor-not-allowed has-data-invalid:text-destructive has-data-disabled:opacity-50">
      <CheckboxGroupPrimitive.Item
        data-slot="checkbox-group-item"
        className={cn(
          "size-4 shrink-0 rounded-sm border border-primary shadow-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring data-invalid:border-destructive [&[data-state=checked]:not([data-invalid])]:bg-primary [&[data-state=checked]:not([data-invalid])]:text-primary-foreground [&[data-state=checked][data-invalid]]:bg-destructive [&[data-state=checked][data-invalid]]:text-primary-foreground [&[data-state=unchecked][data-invalid]]:bg-transparent",
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
  );
}

function CheckboxGroupDescription({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Description>) {
  return (
    <CheckboxGroupPrimitive.Description
      data-slot="checkbox-group-description"
      className={cn(
        "text-[0.8rem] text-muted-foreground leading-none data-invalid:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

function CheckboxGroupMessage({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Message>) {
  return (
    <CheckboxGroupPrimitive.Message
      data-slot="checkbox-group-message"
      className={cn(
        "text-[0.8rem] text-muted-foreground leading-none data-invalid:text-destructive",
        className,
      )}
      {...props}
    />
  );
}

export {
  CheckboxGroup,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupItem,
  CheckboxGroupDescription,
  CheckboxGroupMessage,
};
