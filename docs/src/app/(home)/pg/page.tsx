"use client";

import * as TagsInputPrimitive from "@diceui/tags-input";
import * as React from "react";

import { Shell } from "@/components/shell";
import { X } from "lucide-react";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInputPrimitive.Root
        value={value}
        onValueChange={setValue}
        delimiter=","
        addOnPaste
        addOnTab
        addOnBlur
        className="flex w-full max-w-[420px] flex-wrap items-center gap-2 rounded-md border p-2"
      >
        {value.map((item) => (
          <TagsInputPrimitive.Item
            key={item}
            value={item}
            className="flex h-7 items-center justify-center gap-1.5 rounded bg-accent px-2 py-1"
          >
            <TagsInputPrimitive.Text className="text-sm">
              {item}
            </TagsInputPrimitive.Text>
            <TagsInputPrimitive.Delete>
              <X className="size-3" aria-hidden="true" />
            </TagsInputPrimitive.Delete>
          </TagsInputPrimitive.Item>
        ))}
        <TagsInputPrimitive.Input
          placeholder="Add item..."
          className="flex-1 rounded bg-transparent px-1 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </TagsInputPrimitive.Root>
    </Shell>
  );
}
