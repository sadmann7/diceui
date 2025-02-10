import { Skeleton } from "@/components/ui/skeleton";
import * as Masonry from "@/registry/default/ui/masonry";

const items = [
  {
    id: "1",
    title: "The 900",
    description: "The 900 is a trick where you spin 900 degrees in the air.",
  },
  {
    id: "2",
    title: "Indy Backflip",
    description:
      "The Indy Backflip is a trick where you perform a backflip while doing an Indy.",
  },
  {
    id: "3",
    title: "Pizza Guy",
    description:
      "The Pizza Guy is a trick where you perform a backflip while doing a pizza.",
  },
  {
    id: "4",
    title: "Rocket Air",
    description:
      "The Rocket Air is a trick where you perform a backflip while doing a rocket.",
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
];

export default function MasonryResponsiveDemo() {
  return (
    <Masonry.Root
      columnCount={{ initial: 1, sm: 2, md: 3 }}
      defaultColumnCount={3}
      gap={{ initial: 4, sm: 8, md: 12 }}
      defaultGap={12}
      className="w-full"
    >
      {items.map((item) => (
        <Masonry.Item
          key={item.id}
          fallback={
            <Skeleton className="aspect-video size-full max-h-28 rounded-sm" />
          }
          className="relative touch-none select-none overflow-hidden rounded-sm transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="flex flex-col gap-1 rounded-md border bg-card p-4 text-card-foreground shadow-xs">
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
