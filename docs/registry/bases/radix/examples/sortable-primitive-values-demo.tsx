"use client";

import * as React from "react";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";

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
    <Sortable value={tricks} onValueChange={setTricks} orientation="mixed">
      <SortableContent className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <SortableItem key={trick} value={trick} asChild asHandle>
            <div className="flex size-full flex-col items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {trick}
              </div>
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {(activeItem) => (
          <SortableItem value={activeItem.value} asChild>
            <div className="flex size-full flex-col items-center justify-center rounded-md border border-zinc-200 bg-zinc-100 p-8 text-center shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {activeItem.value}
              </div>
            </div>
          </SortableItem>
        )}
      </SortableOverlay>
    </Sortable>
  );
}
