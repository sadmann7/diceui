"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as TagsInputPrimitive from "@diceui/tags-input";
import { X } from "lucide-react";
import * as React from "react";

const TagsInput = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Root>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Root
    ref={ref}
    className={cn("flex max-w-[420px] flex-col gap-2", className)}
    {...props}
  />
));
TagsInput.displayName = TagsInputPrimitive.Root.displayName;

const TagsInputLabel = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Label>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Label ref={ref} className={cn(className)} {...props} />
));
TagsInputLabel.displayName = TagsInputPrimitive.Label.displayName;

const TagsInputContent = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Content
    ref={ref}
    className={cn(
      "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputContent.displayName = TagsInputPrimitive.Content.displayName;

const TagsInputInput = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Input>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Input
    ref={ref}
    className={cn(
      "flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInputInput.displayName = TagsInputPrimitive.Input.displayName;

const TagsInputItem = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Item>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Item
    ref={ref}
    className={cn(
      "group inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent py-1 pr-0.5 pl-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[disabled]:cursor-not-allowed data-[focused]:bg-accent data-[focused]:text-accent-foreground data-[disabled]:opacity-50 data-[editing]:ring-1 data-[editing]:ring-ring",
      className,
    )}
    {...props}
  >
    <TagsInputPrimitive.Text className="truncate" />
    <TagsInputPrimitive.Delete className="h-4 w-4 flex-shrink-0 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 group-focus:opacity-100">
      <X className="size-3.5" />
    </TagsInputPrimitive.Delete>
  </TagsInputPrimitive.Item>
));
TagsInputItem.displayName = TagsInputPrimitive.Item.displayName;

const TagsInputClear = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Clear>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Clear>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Clear ref={ref} asChild>
    <Button
      variant="outline"
      className={cn(
        "data-[state=visible]:fade-in-0 data-[state=visible]:slide-in-from-bottom-2 data-[state=hidden]:fade-out-0 data-[state=hidden]:slide-out-to-bottom-2 w-full data-[state=visible]:visible data-[state=hidden]:invisible data-[state=hidden]:animate-out data-[state=visible]:animate-in",
        className,
      )}
      {...props}
    >
      <X className="h-4 w-4" />
      Clear
    </Button>
  </TagsInputPrimitive.Clear>
));
TagsInputClear.displayName = TagsInputPrimitive.Clear.displayName;

export {
  TagsInput,
  TagsInputLabel,
  TagsInputContent,
  TagsInputInput,
  TagsInputItem,
  TagsInputClear,
};
