"use client";

import * as TagsInputPrimitive from "@diceui/tags-input";

export default function TagsInputDemo() {
  return (
    <TagsInputPrimitive.Root className="flex w-[380px] flex-col gap-2">
      <TagsInputPrimitive.Label>Fruits</TagsInputPrimitive.Label>
      <TagsInputPrimitive.Content className="flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
        {({ value }) => (
          <>
            {value.map((item) => (
              <TagsInputPrimitive.Item
                key={item}
                value={item}
                className="inline-flex max-w-[calc(100%-8px)] items-center gap-1.5 rounded border bg-transparent px-2.5 py-1 text-sm focus:outline-none data-[disabled]:cursor-not-allowed data-[editable]:select-none data-[editing]:bg-transparent data-[disabled]:opacity-50 data-[editing]:ring-1 data-[editing]:ring-ring [&:not([data-editing])]:pr-1.5 [&[data-highlighted]:not([data-editing])]:bg-zinc-800 [&[data-highlighted]:not([data-editing])]:text-black dark:[&[data-highlighted]:not([data-editing])]:bg-zinc-900 dark:[&[data-highlighted]:not([data-editing])]:text-white"
              >
                {item}
              </TagsInputPrimitive.Item>
            ))}
            <TagsInputPrimitive.Input
              placeholder="Add fruit..."
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </>
        )}
      </TagsInputPrimitive.Content>
      <TagsInputPrimitive.Clear
        dynamic
        className="h-9 rounded-sm border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
      >
        Clear
      </TagsInputPrimitive.Clear>
    </TagsInputPrimitive.Root>
  );
}
