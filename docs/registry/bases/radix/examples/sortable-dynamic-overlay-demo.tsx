"use client";

import * as React from "react";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay,
} from "@/registry/bases/radix/ui/sortable";

interface Trick {
  id: string;
  title: string;
  description: string;
}

export default function SortableDynamicOverlayDemo() {
  const [tricks, setTricks] = React.useState<Trick[]>([
    {
      id: "1",
      title: "The 900",
      description: "The 900 is a trick where you spin 900 degrees in the air.",
    },
    {
      id: "2",
      title: "Indy Backflip",
      description:
        "The Indy Backflip is a trick where you backflip in the air.",
    },
    {
      id: "3",
      title: "Pizza Guy",
      description: "The Pizza Guy is a trick where you flip the pizza guy.",
    },
    {
      id: "4",
      title: "Rocket Air",
      description: "The Rocket Air is a trick where you rocket air.",
    },
    {
      id: "5",
      title: "Kickflip Backflip",
      description:
        "The Kickflip Backflip is a trick where you kickflip backflip.",
    },
    {
      id: "6",
      title: "FS 540",
      description: "The FS 540 is a trick where you fs 540.",
    },
  ]);

  return (
    <Sortable
      value={tricks}
      onValueChange={setTricks}
      getItemValue={(item) => item.id}
      orientation="mixed"
    >
      <SortableContent className="grid auto-rows-fr grid-cols-3 gap-2.5">
        {tricks.map((trick) => (
          <TrickCard key={trick.id} trick={trick} asHandle />
        ))}
      </SortableContent>
      <SortableOverlay>
        {(activeItem) => {
          const trick = tricks.find((trick) => trick.id === activeItem.value);

          if (!trick) return null;

          return <TrickCard trick={trick} />;
        }}
      </SortableOverlay>
    </Sortable>
  );
}

interface TrickCardProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SortableItem>, "value"> {
  trick: Trick;
}

function TrickCard({ trick, ...props }: TrickCardProps) {
  return (
    <SortableItem value={trick.id} asChild {...props}>
      <div className="flex size-full flex-col gap-1 rounded-md border bg-zinc-100 p-4 text-foreground shadow-sm dark:bg-zinc-900">
        <div className="font-medium text-sm leading-tight sm:text-base">
          {trick.title}
        </div>
        <span className="line-clamp-2 hidden text-muted-foreground text-sm sm:inline-block">
          {trick.description}
        </span>
      </div>
    </SortableItem>
  );
}
