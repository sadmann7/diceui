"use client";

import {
  TagsInputInput,
  TagsInputItem,
  TagsInputItemDelete,
  TagsInputItemText,
  TagsInputRoot,
} from "@diceui/tags-input";
import * as React from "react";

import { Shell } from "@/components/shell";
import { X } from "lucide-react";

export default function PlaygroundPage() {
  const [value, setValue] = React.useState<string[]>([]);

  return (
    <Shell>
      <TagsInputRoot
        value={value}
        onValueChange={setValue}
        className="flex w-full max-w-[420px] flex-wrap items-center gap-2 rounded-md border p-2"
      >
        {value.map((item) => (
          <TagsInputItem
            key={item}
            value={item}
            className="flex h-7 items-center justify-center gap-1.5 rounded bg-accent px-2 py-1"
          >
            <TagsInputItemText className="text-sm">{item}</TagsInputItemText>
            <TagsInputItemDelete>
              <X className="size-3" aria-hidden="true" />
            </TagsInputItemDelete>
          </TagsInputItem>
        ))}
        <TagsInputInput
          placeholder="Add item..."
          className="flex-1 rounded bg-transparent px-1 text-sm placeholder:text-muted-foreground focus:outline-none"
        />
      </TagsInputRoot>
    </Shell>
  );
}
