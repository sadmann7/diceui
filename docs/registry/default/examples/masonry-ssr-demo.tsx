import { Skeleton } from "@/components/ui/skeleton";
import * as Masonry from "@/registry/default/ui/masonry";
import { Suspense } from "react";

interface SkateboardTrick {
  id: string;
  title: string;
  description: string;
}

function getTricks(): SkateboardTrick[] {
  return [
    {
      id: "1",
      title: "The 900",
      description: "The 900 is a trick where you spin 900 degrees in the air.",
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
      title: "Kickflip",
      description:
        "A kickflip is performed by flipping your skateboard lengthwise using your front foot.",
    },
    {
      id: "6",
      title: "FS 540",
      description:
        "The FS 540 is a trick where you spin frontside 540 degrees in the air.",
    },
  ];
}

function TrickCard({ trick }: { trick: SkateboardTrick }) {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-4 text-card-foreground shadow-xs">
      <div className="font-medium text-sm leading-tight sm:text-base">
        {trick.title}
      </div>
      <span className="text-muted-foreground text-sm">{trick.description}</span>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-2 rounded-md border bg-card p-4">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
    </div>
  );
}

function TricksGrid() {
  const tricks = getTricks();

  return (
    <Masonry.Root
      columnCount={{ initial: 1, sm: 2, md: 3 }}
      defaultColumnCount={3}
      gap={{ initial: 4, sm: 8, md: 12 }}
      defaultGap={12}
      className="w-full"
    >
      {tricks.map((trick) => (
        <Masonry.Item
          key={trick.id}
          fallback={<SkeletonCard />}
          className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        >
          <TrickCard trick={trick} />
        </Masonry.Item>
      ))}
    </Masonry.Root>
  );
}

export default function MasonrySSRDemo() {
  const skeletonIds = Array.from(
    { length: 6 },
    () => `skeleton-${Math.random().toString(36).substring(2, 9)}`,
  );

  return (
    <Suspense
      fallback={
        <Masonry.Root
          columnCount={{ initial: 1, sm: 2, md: 3 }}
          defaultColumnCount={3}
          gap={{ initial: 4, sm: 8, md: 12 }}
          defaultGap={12}
          className="w-full"
        >
          {skeletonIds.map((id) => (
            <Masonry.Item key={id} fallback={<SkeletonCard />}>
              <SkeletonCard />
            </Masonry.Item>
          ))}
        </Masonry.Root>
      }
    >
      <TricksGrid />
    </Suspense>
  );
}
