import { Skeleton } from "@/components/ui/skeleton";
import { Masonry, MasonryItem } from "@/registry/bases/radix/ui/masonry";

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

export default function MasonrySSRDemo() {
  const tricks = getTricks();
  const skeletonIds = Array.from(
    { length: 6 },
    () => `skeleton-${Math.random().toString(36).substring(2, 9)}`,
  );

  return (
    <Masonry
      columnCount={3}
      gap={{ column: 8, row: 8 }}
      className="w-full"
      fallback={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
          {skeletonIds.map((id) => (
            <SkeletonCard key={id} />
          ))}
        </div>
      }
    >
      {tricks.map((trick) => (
        <MasonryItem
          key={trick.id}
          className="relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
        >
          <TrickCard trick={trick} />
        </MasonryItem>
      ))}
    </Masonry>
  );
}
