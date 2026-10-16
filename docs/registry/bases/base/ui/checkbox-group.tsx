import type * as React from "react";

import * as CheckboxGroupPrimitive from "@diceui/checkbox-group";
import { cn } from "cn";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function CheckboxGroup({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxGroupPrimitive.Root>) {
  return (
    <CheckboxGroupPrimitive.Root
      data-slot="checkbox-group"
      className={cn("cn-checkbox-group peer", className)}
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
      className={cn("cn-checkbox-group-label", className)}
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
      className={cn("cn-checkbox-group-list", className)}
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
    <label className="cn-checkbox-group-item">
      <CheckboxGroupPrimitive.Item
        data-slot="checkbox-group-item"
        className={cn("cn-checkbox-group-item-2", className)}
        {...props}
      >
        <CheckboxGroupPrimitive.Indicator
          className="cn-checkbox-group-item-3"
          asChild
        >
          <IconPlaceholder
            lucide="Check"
            tabler="IconCheck"
            hugeicons="Tick02Icon"
            phosphor="CheckIcon"
            remixicon="RiCheckLine"
            className="cn-checkbox-group-item-4"
          />
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
      className={cn("cn-checkbox-group-description", className)}
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
      className={cn("cn-checkbox-group-message", className)}
      {...props}
    />
  );
}

export {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupMessage,
};
