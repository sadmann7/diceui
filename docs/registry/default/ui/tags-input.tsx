import * as TagsInputPrimitive from "@diceui/tags-input";
import { X } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const TagsInput = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Root
    data-slot="tags-input"
    ref={ref}
    className={cn("flex w-[380px] flex-col gap-2", className)}
    {...props}
  />
));
TagsInput.displayName = TagsInputPrimitive.Root.displayName;

const TagsInputLabel = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Label>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Label
    data-slot="tags-input-label"
    ref={ref}
    className={cn(
      "font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));
TagsInputLabel.displayName = TagsInputPrimitive.Label.displayName;

const TagsInputList = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div
    data-slot="tags-input-list"
    ref={ref}
    className={cn(
      "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputList.displayName = "TagsInputList";

const TagsInputInput = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Input>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Input
    data-slot="tags-input-input"
    ref={ref}
    className={cn(
      "flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputInput.displayName = TagsInputPrimitive.Input.displayName;

const TagsInputItem = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <TagsInputPrimitive.Item
    data-slot="tags-input-item"
    ref={ref}
    className={cn(
      "inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-hidden data-disabled:cursor-not-allowed data-editable:select-none data-editing:bg-transparent data-disabled:opacity-50 data-editing:ring-1 data-editing:ring-ring [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-accent [&[data-highlighted]:not([data-editing])]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <TagsInputPrimitive.ItemText className="truncate">
      {children}
    </TagsInputPrimitive.ItemText>
    <TagsInputPrimitive.ItemDelete className="h-4 w-4 shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100">
      <X className="h-3.5 w-3.5" />
    </TagsInputPrimitive.ItemDelete>
  </TagsInputPrimitive.Item>
));
TagsInputItem.displayName = TagsInputPrimitive.Item.displayName;

const TagsInputClear = React.forwardRef<
  React.ComponentRef<typeof TagsInputPrimitive.Clear>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Clear>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Clear data-slot="tags-input-clear" ref={ref} {...props} />
));
TagsInputClear.displayName = TagsInputPrimitive.Clear.displayName;

export {
  TagsInput,
  TagsInputLabel,
  TagsInputList,
  TagsInputInput,
  TagsInputItem,
  TagsInputClear,
};
