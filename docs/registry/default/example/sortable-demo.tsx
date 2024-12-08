"use client";

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
      <SortableContent className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <SortableItem key={trick.id} value={trick.id} asChild asGrip>
            <div className="flex aspect-video size-full flex-col items-center justify-center border border-zinc-500 p-6 text-center dark:border-zinc-800">
              <div className="font-medium">{trick.title}</div>
              <div className="text-sm text-zinc-500">{trick.points} points</div>
            </div>
          </SortableItem>
        ))}
      </SortableContent>
      <SortableOverlay>
        {({ value }) => {
          const trick = tricks.find((trick) => trick.id === value);
          if (!trick) return null;

          return (
            <SortableItem value={trick.id} asChild>
              <div className="flex aspect-video size-full flex-col items-center justify-center border border-zinc-500 p-6 text-center dark:border-zinc-800">
                <div className="font-medium">{trick.title}</div>
                <div className="text-sm text-zinc-500">
                  {trick.points} points
                </div>
              </div>
            </SortableItem>
          );
        }}
      </SortableOverlay>
    </Sortable>
  );
}
