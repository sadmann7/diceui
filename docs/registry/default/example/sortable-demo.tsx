"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/default/ui/sortable";
import * as React from "react";

export default function SortableDemo() {
  const [items, setItems] = React.useState([
    { id: "1", content: "Kickflip" },
    { id: "2", content: "Heelflip" },
    { id: "5", content: "360 flip" },
    { id: "6", content: "Varial flip" },
    { id: "7", content: "Hardflip" },
    { id: "8", content: "Backside 180" },
  ]);

  return (
    <Sortable value={items} onValueChange={setItems} orientation="both">
      <SortableContent className="grid grid-cols-3 gap-4 p-4">
        {items.map((item) => (
          <SortableItem
            key={item.id}
            value={item.id}
            className="flex aspect-square size-full items-center justify-center border border-zinc-400 p-4 dark:border-zinc-700"
            asGrip
          >
            {item.content}
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => (
          <SortableItem key={value} value={value} asChild>
            <Skeleton className="size-full" />
          </SortableItem>
        )}
      </SortableOverlay>
    </Sortable>
  );
}
