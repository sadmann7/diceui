import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Masonry, MasonryItem } from "@/registry/bases/radix/ui/masonry";

const items = [
  {
    id: "1",
    number: 1,
    aspectRatio: "1/1",
  },
  {
    id: "2",
    number: 2,
    aspectRatio: "4/3",
  },
  {
    id: "3",
    number: 3,
    aspectRatio: "3/4",
  },
  {
    id: "4",
    number: 4,
    aspectRatio: "3/2",
  },
  {
    id: "5",
    number: 5,
    aspectRatio: "1/1",
  },
  {
    id: "6",
    number: 6,
    aspectRatio: "1/1",
  },
];

export default function MasonryLinearDemo() {
  return (
    <Masonry
      gap={10}
      columnWidth={140}
      linear
      fallback={<Skeleton className="h-72 w-full" />}
    >
      {items.map((item) => (
        <MasonryItem
          key={item.id}
          className="flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-xs"
          style={{ aspectRatio: item.aspectRatio }}
        >
          <span className="font-medium text-2xl">{item.number}</span>
        </MasonryItem>
      ))}
    </Masonry>
  );
}
