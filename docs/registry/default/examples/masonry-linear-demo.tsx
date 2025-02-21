import { Skeleton } from "@/components/ui/skeleton";
import * as Masonry from "@/registry/default/ui/masonry";
import * as React from "react";

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
    <Masonry.Root gap={12} linear>
      {items.map((item) => (
        <Masonry.Item
          key={item.id}
          className="flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-xs"
          style={{ aspectRatio: item.aspectRatio }}
        >
          <span className="font-medium text-2xl">{item.number}</span>
        </Masonry.Item>
      ))}
    </Masonry.Root>
  );
}
