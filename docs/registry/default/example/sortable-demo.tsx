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
  const [tricks, setTricks] = React.useState([
    { id: "1", title: "The 900", points: 9000 },
    { id: "2", title: "Indy Backflip", points: 4000 },
    { id: "3", title: "Pizza Guy", points: 1500 },
    { id: "4", title: "360 Varial McTwist", points: 5000 },
    { id: "5", title: "Kickflip Backflip", points: 3000 },
    { id: "6", title: "FS 540", points: 4500 },
  ]);

  return (
    <Sortable value={tricks} onValueChange={setTricks} orientation="both">
      <div className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <SortableItem
            key={trick.id}
            value={trick.id}
            className="flex aspect-video size-full flex-col items-center justify-center border border-zinc-500 p-6 text-center dark:border-zinc-800"
            asGrip
          >
            <div className="font-medium">{trick.title}</div>
            <div className="text-sm text-zinc-500">{trick.points}</div>
          </SortableItem>
        ))}
      </div>
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
