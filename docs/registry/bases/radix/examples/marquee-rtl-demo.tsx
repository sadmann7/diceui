"use client";

import {
  Marquee,
  MarqueeContent,
  MarqueeEdge,
  MarqueeItem,
} from "@/registry/bases/radix/ui/marquee";

const features = [
  {
    title: "RTL Support",
    description:
      "Automatic right-to-left layout support with proper animation direction and gap handling.",
  },
  {
    title: "Smooth Animation",
    description:
      "Seamless scrolling animation that adapts to text direction without any visual gaps.",
  },
  {
    title: "Auto Fill",
    description:
      "Intelligent content duplication to fill the available space for continuous scrolling.",
  },
  {
    title: "Pause on Hover",
    description:
      "Interactive animation that pauses when users hover over the content for better UX.",
  },
  {
    title: "Responsive Design",
    description:
      "Fully responsive component that works perfectly across all device sizes and orientations.",
  },
];

export default function MarqueeRtlDemo() {
  return (
    <Marquee dir="rtl">
      <MarqueeContent>
        {features.map((feature) => (
          <MarqueeItem key={feature.title} asChild>
            <div className="flex w-[280px] flex-col gap-1 rounded-md border bg-card p-4 text-card-foreground shadow-sm">
              <div className="font-medium text-sm leading-tight sm:text-base">
                {feature.title}
              </div>
              <span className="line-clamp-2 text-muted-foreground text-sm">
                {feature.description}
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
