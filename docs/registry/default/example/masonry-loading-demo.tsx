"use client";

import { Skeleton } from "@/components/ui/skeleton";
import * as Masonry from "@/registry/default/ui/masonry";
import * as React from "react";

export default function MasonryLoadingDemo() {
  const [items, setItems] = React.useState<
    Array<{
      id: string;
      title: string;
      description: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setItems([
        {
          id: "1",
          title: "The 900",
          description:
            "The 900 is a trick where you spin 900 degrees in the air.",
        },
        {
          id: "2",
          title: "Indy Backflip",
          description:
            "The Indy Backflip is a trick where you backflip in the air while grabbing the board with your back hand.",
        },
        {
          id: "3",
          title: "Pizza Guy",
          description:
            "The Pizza Guy is a trick where you flip the board like a pizza.",
        },
        {
          id: "4",
          title: "Rocket Air",
          description:
            "The Rocket Air is a trick where you grab the nose of your board and point it straight up to the sky.",
        },
        {
          id: "5",
          title: "Kickflip Backflip",
          description:
            "The Kickflip Backflip is a trick where you perform a kickflip while doing a backflip simultaneously.",
        },
        {
          id: "6",
          title: "FS 540",
          description:
            "The FS 540 is a trick where you spin frontside 540 degrees in the air.",
        },
      ]);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Masonry.Root
      columnCount={{
        initial: 2,
        sm: 2,
        md: 3,
        lg: 4,
      }}
      gap={16}
    >
      {isLoading
        ? Array.from({ length: 6 }).map((_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <Masonry.Item key={index} fallback>
              <div className="flex flex-col gap-2 rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-[60px] w-full" />
              </div>
            </Masonry.Item>
          ))
        : items.map((item) => (
            <Masonry.Item key={item.id}>
              <div className="flex flex-col gap-1 rounded-md border bg-card p-4 text-card-foreground shadow-sm">
                <div className="font-medium text-sm leading-tight sm:text-base">
                  {item.title}
                </div>
                <span className="text-muted-foreground text-sm">
                  {item.description}
                </span>
              </div>
            </Masonry.Item>
          ))}
    </Masonry.Root>
  );
}
