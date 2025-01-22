"use client";

import * as Sortable from "@/registry/default/ui/sortable";
import * as React from "react";

export default function SortableDemo() {
  const [tricks, setTricks] = React.useState([
    { id: "1", title: "The 900", points: 9000 },
    { id: "2", title: "Indy Backflip", points: 4000 },
    { id: "3", title: "Pizza Guy", points: 1500 },
    { id: "4", title: "Rocket Air", points: 5000 },
    { id: "5", title: "Kickflip Backflip", points: 3000 },
    { id: "6", title: "FS 540", points: 4500 },
  ]);

  // Memoize the item renderer to avoid recreating it on each render
  const renderItem = React.useCallback(
    (trick: (typeof tricks)[number]) => (
      <div className="flex size-full flex-col items-center justify-center rounded-md border bg-zinc-100 p-6 text-center text-foreground shadow dark:bg-zinc-900">
        <div className="font-medium text-sm leading-tight sm:text-base">
          {trick.title}
        </div>
        <div className="hidden text-muted-foreground text-sm sm:block">
          {trick.points} points
        </div>
      </div>
    ),
    [],
  );

  return (
    <Sortable.Root
      value={tricks}
      onValueChange={setTricks}
      getItemValue={(item) => item.id}
      orientation="mixed"
      renderItem={renderItem}
    >
      <Sortable.Content className="grid grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <Sortable.Item key={trick.id} value={trick.id} asChild asHandle>
            {renderItem(trick)}
          </Sortable.Item>
        ))}
      </Sortable.Content>
      <Sortable.Overlay />
    </Sortable.Root>
  );
}
