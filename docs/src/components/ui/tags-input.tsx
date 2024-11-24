"use client";

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
    className={cn(
      "flex min-h-10 w-full max-w-[420px] flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
TagsInput.displayName = TagsInputPrimitive.Root.displayName;

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
      "group inline-flex h-7 items-center gap-1 rounded border bg-transparent pr-0.5 pl-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[focused]:bg-accent data-[focused]:text-accent-foreground",
      className,
    )}
    {...props}
  >
    <TagsInputPrimitive.Text />
    <TagsInputPrimitive.Delete className="h-4 w-4 rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 group-focus:opacity-100">
      <X className="h-3 w-3" />
    </TagsInputPrimitive.Delete>
  </TagsInputPrimitive.Item>
));
TagsInputItem.displayName = TagsInputPrimitive.Item.displayName;

const TagsInputClear = React.forwardRef<
  React.ElementRef<typeof TagsInputPrimitive.Clear>,
  React.ComponentPropsWithoutRef<typeof TagsInputPrimitive.Clear>
>(({ className, ...props }, ref) => (
  <TagsInputPrimitive.Clear
    ref={ref}
    className={cn(
      "rounded-sm opacity-50 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
      className,
    )}
    {...props}
  >
    <X className="h-4 w-4" />
  </TagsInputPrimitive.Clear>
));
TagsInputClear.displayName = TagsInputPrimitive.Clear.displayName;

export { TagsInput, TagsInputInput, TagsInputItem, TagsInputClear };
