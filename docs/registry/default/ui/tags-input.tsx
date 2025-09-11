import * as TagsInputPrimitive from "@diceui/tags-input";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function TagsInput({
  className,
  ...props
}: React.ComponentProps<typeof TagsInputPrimitive.Root>) {
  return (
    <TagsInputPrimitive.Root
      data-slot="tags-input"
      className={cn("flex w-[380px] flex-col gap-2", className)}
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
      className={cn(
        "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      {...props}
    />
  );
}

function TagsInputList({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tags-input-list"
      className={cn(
        "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
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
      className={cn(
        "flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
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
      className={cn(
        "inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-hidden data-disabled:cursor-not-allowed data-editable:select-none data-editing:bg-transparent data-disabled:opacity-50 data-editing:ring-1 data-editing:ring-ring [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-accent [&[data-highlighted]:not([data-editing])]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <TagsInputPrimitive.ItemText className="truncate">
        {children}
      </TagsInputPrimitive.ItemText>
      <TagsInputPrimitive.ItemDelete className="size-4 shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
        <X className="size-3.5" />
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
  TagsInputLabel,
  TagsInputList,
  TagsInputInput,
  TagsInputItem,
  TagsInputClear,
};
