import type * as React from "react";

import * as MentionPrimitive from "@diceui/mention";
import { cn } from "cn";

function Mention({
  className,
  ...props
}: React.ComponentProps<typeof MentionPrimitive.Root>) {
  return (
    <MentionPrimitive.Root
      data-slot="mention"
      className={cn("cn-mention", className)}
      {...props}
    />
  );
}

function MentionLabel({
  className,
  ...props
}: React.ComponentProps<typeof MentionPrimitive.Label>) {
  return (
    <MentionPrimitive.Label
      data-slot="mention-label"
      className={cn("cn-mention-label", className)}
      {...props}
    />
  );
}

function MentionInput({
  className,
  ...props
}: React.ComponentProps<typeof MentionPrimitive.Input>) {
  return (
    <MentionPrimitive.Input
      data-slot="mention-input"
      className={cn("cn-mention-input", className)}
      {...props}
    />
  );
}

function MentionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MentionPrimitive.Content>) {
  return (
    <MentionPrimitive.Portal>
      <MentionPrimitive.Content
        data-slot="mention-content"
        className={cn("cn-mention-content", className)}
        {...props}
      >
        {children}
      </MentionPrimitive.Content>
    </MentionPrimitive.Portal>
  );
}

function MentionItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof MentionPrimitive.Item>) {
  return (
    <MentionPrimitive.Item
      data-slot="mention-item"
      className={cn("cn-mention-item", className)}
      {...props}
    >
      {children}
    </MentionPrimitive.Item>
  );
}

export { Mention, MentionContent, MentionInput, MentionItem, MentionLabel };
