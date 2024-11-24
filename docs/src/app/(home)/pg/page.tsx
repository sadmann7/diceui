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
        className="flex w-full max-w-[420px] flex-wrap items-center gap-2 rounded-md border p-2 focus-within:border-primary focus-within:outline-none"
      >
        {value.map((item, index) => (
          <TagsInputPrimitive.Item
            key={item}
            value={item}
            index={index}
            className="flex h-7 items-center justify-center gap-1.5 rounded border bg-transparent px-2 py-1 data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[disabled]:opacity-50"
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
