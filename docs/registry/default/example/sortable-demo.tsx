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
    { id: "3", content: "Pop Shove-it" },
    { id: "4", content: "Ollie" },
  ]);

  return (
    <Sortable value={items} onValueChange={setItems}>
      <SortableContent className="flex flex-col gap-4">
        {items.map((item) => (
          <SortableItem key={item.id} value={item.id} asGrip>
            <div className="flex items-center gap-2 rounded-md border p-4">
              {item.content}
            </div>
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
