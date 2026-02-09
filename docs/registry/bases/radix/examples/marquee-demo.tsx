"use client";

import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from "@/registry/bases/radix/ui/marquee";

const tricks = [
  {
    title: "Kickflip",
    description:
      "A kickflip is a trick where you kick the board forward while jumping, and then land on the board with the other foot.",
  },
  {
    title: "Heelflip",
    description:
      "A heelflip is a trick where you flip the board backwards while jumping, and then land on the board with the other foot.",
  },
  {
    title: "Tre Flip",
    description:
      "A tre flip is a trick where you flip the board sideways while jumping, and then land on the board with the other foot.",
  },
  {
    title: "FS 540",
    description:
      "A fs 540 is a trick where you flip the board 540 degrees while jumping, and then land on the board with the other foot.",
  },
  {
    title: "360 Varial McTwist",
    description:
      "A 360 varial mc twist is a trick where you flip the board 360 degrees while jumping, and then land on the board with the other foot.",
  },
];

export default function MarqueeDemo() {
  return (
    <Marquee
      aria-label="Skateboard tricks showcase"
      pauseOnHover
      pauseOnKeyboard
    >
      <MarqueeContent>
        {tricks.map((trick) => (
          <MarqueeItem key={trick.title} asChild>
            <div className="flex w-[260px] flex-col gap-1 rounded-md border bg-card p-4 text-card-foreground shadow-sm">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {trick.title}
              </div>
              <span className="line-clamp-2 text-muted-foreground text-sm">
                {trick.description}
              </span>
            </div>
          </MarqueeItem>
        ))}
      </MarqueeContent>
      <MarqueeEdge side="left" />
      <MarqueeEdge side="right" />
    </Marquee>
  );
}
