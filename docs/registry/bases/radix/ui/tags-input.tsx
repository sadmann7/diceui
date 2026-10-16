import type * as React from "react";

import * as TagsInputPrimitive from "@diceui/tags-input";
import { cn } from "cn";

import { IconPlaceholder } from "@/registry/icons/icon-placeholder";

function TagsInput({
  className,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Root>) {
  return (
    <TagsInputPrimitive.Root
      data-slot="tags-input"
      className={cn("cn-tags-input", className)}
      {...props}
    />
  );
}

function TagsInputLabel({
  className,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Label>) {
  return (
    <TagsInputPrimitive.Label
      data-slot="tags-input-label"
      className={cn("cn-tags-input-label", className)}
      {...props}
    />
  );
}

function TagsInputList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tags-input-list"
      className={cn("cn-tags-input-list", className)}
      {...props}
    />
  );
}

function TagsInputInput({
  className,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Input>) {
  return (
    <TagsInputPrimitive.Input
      data-slot="tags-input-input"
      className={cn("cn-tags-input-input", className)}
      {...props}
    />
  );
}

function TagsInputItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Item>) {
  return (
    <TagsInputPrimitive.Item
      data-slot="tags-input-item"
      className={cn("cn-tags-input-item", className)}
      {...props}
    >
      <TagsInputPrimitive.ItemText className="cn-tags-input-item-2">
        {children}
      </TagsInputPrimitive.ItemText>
      <TagsInputPrimitive.ItemDelete className="cn-tags-input-item-3">
        <IconPlaceholder
          lucide="X"
          tabler="IconX"
          hugeicons="Cancel01Icon"
          phosphor="XIcon"
          remixicon="RiCloseLine"
          className="cn-tags-input-item-4"
        />
      </TagsInputPrimitive.ItemDelete>
    </TagsInputPrimitive.Item>
  );
}

function TagsInputClear({
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Clear>) {
  return <TagsInputPrimitive.Clear data-slot="tags-input-clear" {...props} />;
}

export {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
};
