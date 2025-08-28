"use client";

import * as React from "react";
import * as Sortable from "@/registry/default/ui/sortable";

export default function SortablePrimitiveValuesDemo() {
  const [tricks, setTricks] = React.useState([
    "The 900",
    "Indy Backflip",
    "Pizza Guy",
    "Rocket Air",
    "Kickflip Backflip",
    "FS 540",
  ]);

  return (
    <Sortable.Root value={tricks} onValueChange={setTricks} orientation="mixed">
      <Sortable.Content className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <Sortable.Item key={trick} value={trick} asChild asHandle>
            <div className="flex size-full flex-col items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {trick}
              </div>
            </div>
          </Sortable.Item>
        ))}
      </Sortable.Content>
      <Sortable.Overlay>
        {(activeItem) => (
          <Sortable.Item value={activeItem.value} asChild>
            <div className="flex size-full flex-col items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {activeItem.value}
              </div>
            </div>
          </Sortable.Item>
        )}
      </Sortable.Overlay>
    </Sortable.Root>
  );
}
